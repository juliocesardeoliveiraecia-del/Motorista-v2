import { createClient } from "npm:@supabase/supabase-js@2";
import { DOMParser } from "npm:linkedom@0.18.12";
import { getDocument } from "npm:pdfjs-dist@4.10.38/legacy/build/pdf.mjs";

const ALLOWED_HOSTS = new Set([
  "www2.camara.leg.br", "www.planalto.gov.br", "planalto.gov.br",
  "brasil.un.org", "www.ohchr.org", "www.unodc.org", "unodc.org",
]);
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
  });
}
async function digest(value: string | Uint8Array) {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : value;
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  const hash = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hash)).map(byte => byte.toString(16).padStart(2, "0")).join("");
}

function normalizeText(value: string) {
  return value.replace(/\u00a0/g, " ").replace(/[\t\r ]+/g, " ")
    .replace(/ *\n */g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}
function extractHtml(html: string) {
  const parsed = new DOMParser().parseFromString(html, "text/html");
  if (!parsed?.body) throw new Error("HTML original sem body.");
  for (const node of parsed.querySelectorAll("script,style,noscript,nav,footer,header,form,iframe,svg")) node.remove();
  return normalizeText(parsed.body.textContent || "");
}

async function extractPdfText(bytes: Uint8Array) {
  const task = getDocument({
    data: bytes,
    disableFontFace: true,
    useSystemFonts: true,
    isEvalSupported: false,
    useWorkerFetch: false,
  });
  const pdf = await task.promise;
  const pages: string[] = [];
  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const items = content.items as Array<{ str?: string }>;
      pages.push(items.map(item => item.str || "").join(" "));
      page.cleanup();
    }
  } finally {
    await pdf.destroy();
  }
  return normalizeText(pages.join("\n"));
}

function allowedSource(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && ALLOWED_HOSTS.has(url.hostname);
  } catch { return false; }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return response({ error: "Método não permitido." }, 405);

  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anonKey || !serviceKey) return response({ error: "Configuração segura do Supabase incompleta." }, 500);

  const token = (req.headers.get("authorization") || "").match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return response({ error: "Autenticação obrigatória." }, 401);
  const userClient = createClient(url, anonKey, {
    global: { headers: { Authorization: "Bearer " + token } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser(token);
  if (userError || !userData.user) return response({ error: "Sessão inválida." }, 401);
  const { data: admin, error: adminError } = await userClient.rpc("is_admin");
  if (adminError || admin !== true) return response({ error: "Apenas administradores podem revisar textos jurídicos." }, 403);

  let payload: { version_id?: string; action?: string; review_note?: string; offset?: number; limit?: number };
  try { payload = await req.json(); }
  catch { return response({ error: "Corpo JSON inválido." }, 400); }
  const versionId = String(payload.version_id || "");
  const action = String(payload.action || "");
  const reviewNote = String(payload.review_note || "").slice(0, 2000);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(versionId)) {
    return response({ error: "Identificador de versão inválido." }, 400);
  }
  if (!["preview", "approve", "publish", "reject"].includes(action)) return response({ error: "Ação inválida." }, 400);
  if (action !== "preview" && reviewNote.trim().length < 5) return response({ error: "Registre uma justificativa de revisão com pelo menos cinco caracteres." }, 400);

  const service = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: version, error: versionError } = await service
    .from("legal_document_versions")
    .select("id,document_id,status,version_label,source_url,source_retrieved_at,source_etag,source_last_modified,content_sha256,storage_path,change_summary")
    .eq("id", versionId)
    .maybeSingle();
  if (versionError || !version) return response({ error: "Versão jurídica não encontrada." }, 404);

  if (action === "reject") {
    if (!["candidate", "in_review", "approved"].includes(version.status)) {
      return response({ error: "Somente candidatas ou versões aprovadas ainda não publicadas podem ser rejeitadas." }, 409);
    }
    const summary = {
      ...(version.change_summary || {}),
      editorial_decision: "rejected",
      editorial_review_note: reviewNote,
      editorial_reviewed_by: userData.user.id,
      editorial_reviewed_at: new Date().toISOString(),
    };
    const { data: rejected, error: rejectError } = await service
      .from("legal_document_versions")
      .update({ status: "rejected", reviewed_by: userData.user.id, reviewed_at: new Date().toISOString(), change_summary: summary })
      .eq("id", versionId)
      .in("status", ["candidate", "in_review", "approved"])
      .select("id,status,document_id")
      .maybeSingle();
    if (rejectError || !rejected) return response({ error: rejectError?.message || "A versão mudou durante a revisão." }, 409);
    const { error: eventError } = await service.from("legal_change_events").insert({
      document_id: version.document_id, version_id: versionId, event_type: "review_requested", severity: "high",
      details: { decision: "rejected", reviewed_by: userData.user.id, review_note: reviewNote },
    });
    if (eventError) return response({ error: "Versão rejeitada, mas o evento de auditoria não foi registrado." }, 500);
    return response({ ...rejected, note: "Versão rejeitada e mantida no histórico; não será exibida aos alunos." });
  }

  if (action === "preview" && !["candidate", "in_review", "approved"].includes(version.status)) {
    return response({ error: "Somente candidatas ou versões aprovadas podem ser pré-visualizadas." }, 409);
  }
  if (action === "approve" && !["candidate", "in_review"].includes(version.status)) {
    return response({ error: "Somente versões candidatas ou em revisão podem ser aprovadas." }, 409);
  }
  if (action === "publish" && version.status !== "approved") {
    return response({ error: "A versão precisa estar aprovada antes da publicação." }, 409);
  }
  if (!version.storage_path || !version.content_sha256 || !allowedSource(version.source_url)) {
    return response({ error: "A versão não possui pacote íntegro ou fonte oficial autorizada." }, 409);
  }
  const { data: file, error: fileError } = await service.storage.from("legal-library").download(version.storage_path);
  if (fileError || !file) return response({ error: "Pacote privado da versão não encontrado." }, 409);

  let pack: Record<string, unknown>;
  try { pack = JSON.parse(await file.text()); }
  catch { return response({ error: "Pacote jurídico não é um JSON válido." }, 409); }
  const text = typeof pack.normalized_text === "string" ? pack.normalized_text : "";
  const sourceMeta = pack.source as { url?: unknown; sha256_raw?: unknown; content_type?: unknown } | undefined;
  const summary = version.change_summary as { sha256_raw?: string } | null;
  const sourceBytesBase64 = typeof pack.source_bytes_base64 === "string" ? pack.source_bytes_base64 : "";
  const sourceFormat = pack.source_format === "application/pdf" ? "application/pdf" : "text/html";
  if (pack.document_id !== version.document_id || pack.sha256_text !== version.content_sha256 ||
      sourceMeta?.url !== version.source_url || sourceMeta?.content_type !== sourceFormat ||
      (sourceFormat === "text/html" && typeof pack.source_html !== "string") ||
      (sourceFormat === "application/pdf" && pack.source_html !== null) ||
      !sourceBytesBase64 || text.length < 1200) {
    return response({ error: "Pacote, documento, origem ou metadados de integridade não conferem." }, 409);
  }

  const sourceBytes = Uint8Array.from(atob(sourceBytesBase64), character => character.charCodeAt(0));
  const reproducedText = sourceFormat === "application/pdf"
    ? await extractPdfText(sourceBytes)
    : extractHtml(pack.source_html as string);
  if (await digest(text) !== version.content_sha256 || reproducedText !== text) {
    return response({ error: "Hash SHA-256 ou extração reproduzida não confere. Publicação bloqueada." }, 409);
  }

  const sourceHash = await digest(sourceBytes);
  if (sourceHash !== summary?.sha256_raw || sourceMeta?.sha256_raw !== sourceHash) {
    return response({ error: "Hash SHA-256 da captura original não confere. Publicação bloqueada." }, 409);
  }

  if (action === "preview") {
    const offset = Math.max(0, Math.floor(Number(payload.offset) || 0));
    const limit = Math.min(80000, Math.max(1000, Math.floor(Number(payload.limit) || 80000)));
    if (offset > text.length) return response({ error: "Trecho solicitado fora do documento." }, 416);
    const nextOffset = offset + limit < text.length ? offset + limit : null;
    return response({
      version_id: versionId,
      document_id: version.document_id,
      version_label: version.version_label,
      source_url: version.source_url,
      source_retrieved_at: version.source_retrieved_at,
      source_etag: version.source_etag,
      source_last_modified: version.source_last_modified,
      source_format: sourceFormat,
      content_sha256: version.content_sha256,
      source_sha256: sourceHash,
      total_chars: text.length,
      offset,
      next_offset: nextOffset,
      preview_text: text.slice(offset, offset + limit),
      integrity_verified: true,
    });
  }

  if (action === "approve") {
    const reviewSummary = {
      ...(version.change_summary || {}),
      editorial_decision: "approved",
      editorial_review_note: reviewNote,
      editorial_reviewed_by: userData.user.id,
      editorial_reviewed_at: new Date().toISOString(),
      editorial_integrity_verified: true,
    };
    const { data: approved, error: approveError } = await service
      .from("legal_document_versions")
      .update({
        status: "approved",
        reviewed_by: userData.user.id,
        reviewed_at: new Date().toISOString(),
        change_summary: reviewSummary,
      })
      .eq("id", versionId)
      .in("status", ["candidate", "in_review"])
      .select("id,status,document_id")
      .maybeSingle();
    if (approveError || !approved) return response({ error: approveError?.message || "A versão mudou durante a revisão." }, 409);
    const { error: eventError } = await service.from("legal_change_events").insert({
      document_id: version.document_id, version_id: versionId, event_type: "approved", severity: "info",
      details: { reviewed_by: userData.user.id, review_note: reviewNote, integrity_verified: true },
    });
    if (eventError) return response({ error: "Versão aprovada, mas o evento de auditoria não foi registrado." }, 500);
    return response({ ...approved, note: "Integridade conferida e versão aprovada. Ela ainda não foi publicada para estudantes." });
  }

  const { data: published, error: publishError } = await userClient.rpc("publish_legal_document_version", {
    p_version_id: versionId,
    p_review_note: reviewNote,
  });
  if (publishError) return response({ error: publishError.message || "Publicação atômica recusada." }, 409);
  return response({
    ...published,
    note: "Versão publicada após revisão administrativa e SHA-256. A sincronização dos aplicativos ocorrerá quando o aluno estiver online.",
  });
});
