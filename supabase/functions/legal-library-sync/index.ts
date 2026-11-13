import { createClient } from "npm:@supabase/supabase-js@2";

type LegalDocument = {
  document_id: string;
  slug: string;
  official_title: string;
  display_title: string;
  official_source_url: string;
  authority: string;
  category: string;
  jurisdiction: string;
  priority: string;
};

const ALLOWED_HOSTS = new Set([
  "www2.camara.leg.br",
  "www.planalto.gov.br",
  "planalto.gov.br",
  "brasil.un.org",
  "www.unodc.org",
  "unodc.org",
]);
const BUCKET = "legal-library";
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

function normalizeText(value: string) {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/[\t\r ]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractHtml(html: string) {
  const parsed = new DOMParser().parseFromString(html, "text/html");
  if (!parsed?.body) throw new Error("HTML oficial sem elemento body.");
  for (const node of parsed.querySelectorAll("script,style,noscript,nav,footer,header,form,iframe,svg")) {
    node.remove();
  }
  return normalizeText(parsed.body.textContent || "");
}

function isAllowedUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && ALLOWED_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

async function fetchOfficial(url: string) {
  if (!isAllowedUrl(url)) throw new Error("Domínio da fonte fora da lista oficial permitida.");
  const result = await fetch(url, {
    headers: {
      "User-Agent": "DoctorConcursos-LegalLibrary/1.0 (official-source-monitor)",
      "Accept": "text/html,application/xhtml+xml,application/pdf;q=0.9,*/*;q=0.1",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(20000),
  });
  if (!result.ok) throw new Error("Fonte oficial respondeu HTTP " + result.status + ".");
  if (!isAllowedUrl(result.url)) throw new Error("Redirecionamento para domínio não autorizado.");
  const contentType = (result.headers.get("content-type") || "").toLowerCase();
  if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) {
    throw new Error("Formato não suportado para extração automática: " + (contentType || "desconhecido"));
  }
  const rawBytes = new Uint8Array(await result.arrayBuffer());
  const prefix = new TextDecoder("windows-1252").decode(rawBytes.slice(0, 4096));
  const metaCharset = prefix.match(/<meta[^>]+charset=["']?([^"'\s/>;]+)/i)?.[1];
  const headerCharset = contentType.match(/charset=([^;\s]+)/i)?.[1];
  const charset = (headerCharset || metaCharset || "utf-8").replace(/["']/g, "").toLowerCase();
  let html: string;
  try {
    html = new TextDecoder(charset).decode(rawBytes);
  } catch {
    throw new Error("Codificação da fonte oficial não reconhecida: " + charset);
  }
  if (html.includes("\uFFFD") || html.length < 1200 || /captcha|cloudflare|access denied|verificação de segurança/i.test(html.slice(0, 2500))) {
    throw new Error("A resposta não parece conter o texto oficial integral ou apresentou erro de codificação.");
  }
  return {
    html,
    rawBytes,
    finalUrl: result.url,
    etag: result.headers.get("etag"),
    lastModified: result.headers.get("last-modified"),
    contentType,
    charset,
  };
}

async function resolveDocumentSource(doc: LegalDocument, landingHtml: string, landingUrl: string) {
  if (doc.document_id !== "BR-CF-1988" && doc.document_id !== "BR-ADCT-1988") {
    return { url: landingUrl, html: landingHtml };
  }
  const page = new DOMParser().parseFromString(landingHtml, "text/html");
  const anchors = Array.from(page.querySelectorAll("a[href]"));
  const match = anchors.find((anchor) => {
    const href = anchor.getAttribute("href") || "";
    const label = (anchor.textContent || "").toLowerCase();
    if (doc.document_id === "BR-CF-1988") {
      return href.toLowerCase().includes("constituicaotextoatualizado") || (label.includes("formato html") && !href.toLowerCase().includes("adct"));
    }
    return href.toLowerCase().includes("constituicao-adct") || (label.includes("formato html") && href.toLowerCase().includes("adct"));
  });
  if (!match) throw new Error("Não foi possível localizar o link HTML oficial específico desta obra.");
  const url = new URL(match.getAttribute("href") || "", landingUrl).toString();
  if (!isAllowedUrl(url)) throw new Error("Link HTML resolvido fora dos domínios oficiais permitidos.");
  return { url };
}

function validateExtractedText(doc: LegalDocument, text: string) {
  if (text.length < 1200) throw new Error("Texto extraído abaixo do tamanho mínimo de segurança.");
  if (!/\bArt\.?\s*\d+|\bArtigo\s+\d+/i.test(text)) {
    throw new Error("Não foi encontrada estrutura mínima de artigos; captura bloqueada.");
  }
  const id = doc.document_id;
  if (id === "BR-CF-1988" && !/CONSTITUIÇÃO DA REPÚBLICA FEDERATIVA DO BRASIL/i.test(text)) {
    throw new Error("A captura não corresponde ao título esperado da Constituição.");
  }
  if (id === "BR-ADCT-1988" && !/DISPOSIÇÕES CONSTITUCIONAIS TRANSITÓRIAS/i.test(text)) {
    throw new Error("A captura não corresponde ao ADCT.");
  }
  if (id === "BR-CTB-1997" && !/CÓDIGO DE TRÂNSITO BRASILEIRO|LEI Nº 9\.503/i.test(text)) {
    throw new Error("A captura não corresponde ao CTB.");
  }
  if (id === "INT-UDHR-1948-PT" && !/DECLARAÇÃO UNIVERSAL DOS DIREITOS HUMANOS/i.test(text)) {
    throw new Error("A captura não corresponde à DUDH.");
  }
}

async function sha256(value: string | Uint8Array) {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : value;
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return response({ error: "Método não permitido." }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceKey) return response({ error: "Configuração segura do Supabase incompleta." }, 500);

  const bearer = req.headers.get("authorization") || "";
  const token = bearer.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return response({ error: "Autenticação obrigatória." }, 401);

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: "Bearer " + token } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser(token);
  if (userError || !userData.user) return response({ error: "Sessão inválida." }, 401);
  const { data: admin, error: adminError } = await userClient.rpc("is_admin");
  if (adminError || admin !== true) return response({ error: "Apenas administradores podem iniciar a captura jurídica." }, 403);

  const service = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let requestedIds: string[] = [];
  try {
    const payload = await req.json().catch(() => ({}));
    requestedIds = Array.isArray(payload.document_ids)
      ? payload.document_ids.filter((id: unknown) => typeof id === "string").slice(0, 13)
      : [];
  } catch {
    return response({ error: "Corpo JSON inválido." }, 400);
  }

  const { data: documents, error: docsError } = await service
    .from("legal_documents")
    .select("document_id,slug,official_title,display_title,official_source_url,authority,category,jurisdiction,priority")
    .eq("is_active", true)
    .order("priority", { ascending: true });
  if (docsError || !documents) return response({ error: "Não foi possível ler o catálogo jurídico." }, 500);

  const selected = (documents as LegalDocument[]).filter((doc) => !requestedIds.length || requestedIds.includes(doc.document_id));
  const { data: run, error: runError } = await service
    .from("legal_update_runs")
    .insert({ trigger_type: "manual", status: "running" })
    .select("id")
    .single();
  if (runError || !run) return response({ error: "Não foi possível iniciar o registro da captura." }, 500);

  const results: Array<Record<string, unknown>> = [];
  let changes = 0;
  let candidates = 0;
  for (const doc of selected) {
    try {
      // Mandela Rules currently points to a PDF. Keep it blocked until a reproducible,
      // text-preserving official Portuguese extraction adapter is reviewed.
      if (doc.document_id === "INT-MANDELA-2015-PT") {
        throw new Error("Fonte oficial em PDF; extração textual automática ainda não homologada.");
      }

      const landing = await fetchOfficial(doc.official_source_url);
      const resolved = await resolveDocumentSource(doc, landing.html, landing.finalUrl);
      const source = resolved.html
        ? { html: resolved.html, finalUrl: resolved.url, etag: landing.etag, lastModified: landing.lastModified, contentType: landing.contentType }
        : await fetchOfficial(resolved.url);
      const extracted = extractHtml(source.html);
      validateExtractedText(doc, extracted);
      const rawHash = await sha256(source.rawBytes);
      const textHash = await sha256(extracted);

      const { data: duplicate } = await service
        .from("legal_document_versions")
        .select("id,status")
        .eq("document_id", doc.document_id)
        .eq("content_sha256", textHash)
        .limit(1)
        .maybeSingle();
      if (duplicate) {
        results.push({ document_id: doc.document_id, status: "unchanged", version_id: duplicate.id });
        continue;
      }

      const versionId = crypto.randomUUID();
      const versionLabel = "sha256-" + textHash.slice(0, 16);
      const storagePath = doc.document_id + "/" + versionId + "/official-source.json";
      const packageBody = JSON.stringify({
        schema_version: 1,
        document_id: doc.document_id,
        official_title: doc.official_title,
        source: {
          authority: doc.authority,
          url: source.finalUrl,
          retrieved_at: new Date().toISOString(),
          etag: source.etag,
          last_modified: source.lastModified,
          content_type: source.contentType,
          charset: source.charset || "utf-8",
          sha256_raw: rawHash,
        },
        source_html: source.html,
        normalized_text: extracted,
        sha256_text: textHash,
        extraction: { method: "DOMParser.textContent", pipeline_version: "1.0.0" },
      });

      const { error: uploadError } = await service.storage.from(BUCKET).upload(storagePath, packageBody, {
        contentType: "application/json",
        upsert: false,
      });
      if (uploadError) throw new Error("Falha ao armazenar pacote oficial: " + uploadError.message);

      const { data: version, error: versionError } = await service
        .from("legal_document_versions")
        .insert({
          id: versionId,
          document_id: doc.document_id,
          version_label: versionLabel,
          source_url: source.finalUrl,
          source_retrieved_at: new Date().toISOString(),
          source_etag: source.etag,
          source_last_modified: source.lastModified,
          content_sha256: textHash,
          storage_path: storagePath,
          content_format: "application/json",
          status: "candidate",
          change_summary: {
            sha256_raw: rawHash,
            sha256_text: textHash,
            extraction_method: "DOMParser.textContent",
            pipeline_version: "1.0.0",
            source_content_type: source.contentType,
            requires_editorial_review: true,
          },
        })
        .select("id")
        .single();
      if (versionError || !version) {
        await service.storage.from(BUCKET).remove([storagePath]);
        throw new Error("Falha ao registrar versão candidata: " + (versionError?.message || "sem retorno"));
      }

      await service.from("legal_change_events").insert({
        run_id: run.id,
        document_id: doc.document_id,
        version_id: version.id,
        event_type: "candidate_created",
        severity: "medium",
        details: { source_url: source.finalUrl, sha256: textHash, requires_review: true },
      });
      candidates++;
      changes++;
      results.push({ document_id: doc.document_id, status: "candidate_created", version_id: version.id, sha256: textHash });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha desconhecida na captura.";
      await service.from("legal_change_events").insert({
        run_id: run.id,
        document_id: doc.document_id,
        event_type: "capture_failed",
        severity: "high",
        details: { message },
      });
      results.push({ document_id: doc.document_id, status: "blocked", reason: message });
    }
  }

  const failures = results.filter((item) => item.status === "blocked").length;
  await service.from("legal_update_runs").update({
    status: failures ? (candidates ? "completed_with_errors" : "failed") : "completed",
    completed_at: new Date().toISOString(),
    documents_checked: selected.length,
    changes_detected: changes,
    candidates_created: candidates,
    errors: results.filter((item) => item.status === "blocked"),
    summary: { initiated_by: userData.user.id, results },
  }).eq("id", run.id);

  return response({
    run_id: run.id,
    status: failures ? (candidates ? "completed_with_errors" : "failed") : "completed",
    documents_checked: selected.length,
    candidates_created: candidates,
    results,
    note: "Nenhuma versão foi publicada automaticamente. Toda captura permanece candidata até revisão e aprovação.",
  });
});
