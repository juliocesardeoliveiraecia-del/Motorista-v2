import { createClient } from "npm:@supabase/supabase-js@2";
import { DOMParser } from "npm:linkedom@0.18.12";
import { getDocument } from "npm:pdfjs-dist@4.10.38/legacy/build/pdf.mjs";

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
  "www.ohchr.org",
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

function isAllowedUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && ALLOWED_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

async function fetchOfficial(
  url: string,
  conditionals: { etag?: string | null; lastModified?: string | null } = {},
) {
  if (!isAllowedUrl(url)) throw new Error("Domínio da fonte fora da lista oficial permitida.");
  const headers = new Headers({
    "User-Agent": "DoctorConcursos-LegalLibrary/1.0 (official-source-monitor)",
    "Accept": "text/html,application/xhtml+xml,application/pdf;q=0.9,*/*;q=0.1",
  });
  if (conditionals.etag) headers.set("If-None-Match", conditionals.etag);
  if (conditionals.lastModified) headers.set("If-Modified-Since", conditionals.lastModified);
  const result = await fetch(url, {
    headers,
    redirect: "follow",
    signal: AbortSignal.timeout(20000),
  });
  if (!isAllowedUrl(result.url)) throw new Error("Redirecionamento para domínio não autorizado.");
  if (result.status === 304) {
    return {
      notModified: true as const,
      finalUrl: result.url,
      etag: result.headers.get("etag") || conditionals.etag || null,
      lastModified: result.headers.get("last-modified") || conditionals.lastModified || null,
    };
  }
  if (!result.ok) throw new Error("Fonte oficial respondeu HTTP " + result.status + ".");
  const contentType = (result.headers.get("content-type") || "").toLowerCase();
  const rawBytes = new Uint8Array(await result.arrayBuffer());
  if (contentType.includes("application/pdf") || result.url.toLowerCase().endsWith(".pdf")) {
    const normalizedText = await extractPdfText(rawBytes);
    if (normalizedText.length < 1200) throw new Error("PDF oficial sem texto extraível suficiente.");
    return {
      notModified: false as const,
      html: undefined,
      normalizedText,
      rawBytes,
      finalUrl: result.url,
      etag: result.headers.get("etag"),
      lastModified: result.headers.get("last-modified"),
      contentType: "application/pdf",
      charset: null,
    };
  }
  if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) {
    throw new Error("Formato não suportado para extração automática: " + (contentType || "desconhecido"));
  }
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
    notModified: false as const,
    html,
    normalizedText: undefined,
    rawBytes,
    finalUrl: result.url,
    etag: result.headers.get("etag"),
    lastModified: result.headers.get("last-modified"),
    contentType,
    charset,
  };
}

async function resolveDocumentSource(_doc: LegalDocument, sourceHtml: string, sourceUrl: string) {
  // The catalog now points directly to the official updated HTML for each Brazilian law.
  return { url: sourceUrl, html: sourceHtml };
}

function validateExtractedText(doc: LegalDocument, text: string) {
  if (text.length < 1200) throw new Error("Texto extraído abaixo do tamanho mínimo de segurança.");
  const isMandela = doc.document_id === "INT-MANDELA-2015-PT";
  if (!isMandela && !/\bArt\.?\s*\d+|\bArtigo\s+\d+/i.test(text)) {
    throw new Error("Não foi encontrada estrutura mínima de artigos; captura bloqueada.");
  }
  if (isMandela && (!/REGRA\s+1\b/i.test(text) || !/REGRA\s+122\b/i.test(text))) {
    throw new Error("O PDF não contém a sequência completa das Regras de Mandela (1 a 122).");
  }
  const id = doc.document_id;
  if (id === "BR-CF-1988" && !/CONSTITUIÇÃO DA REPÚBLICA FEDERATIVA DO BRASIL/i.test(text)) {
    throw new Error("A captura não corresponde ao título esperado da Constituição.");
  }
  if (id === "BR-ADCT-1988" && !/DISPOSIÇÕES CONSTITUCIONAIS TRANSITÓRIAS/i.test(text)) {
    throw new Error("A captura não corresponde ao ADCT.");
  }
  if (id === "BR-CF-1988" && !/EMENDA CONSTITUCIONAL Nº 141|EC Nº 141/i.test(text)) {
    throw new Error("A captura da Constituição não comprova a atualização até a EC 141/2026.");
  }
  if (id === "BR-ADCT-1988" && !/EMENDA CONSTITUCIONAL Nº 136|EC Nº 136/i.test(text)) {
    throw new Error("A captura do ADCT não comprova a atualização do ADCT até a EC 136/2025.");
  }
  if (id === "BR-CTB-1997" && !/CÓDIGO DE TRÂNSITO BRASILEIRO|LEI Nº 9\.503/i.test(text)) {
    throw new Error("A captura não corresponde ao CTB.");
  }
  const expectedTitles: Record<string, RegExp> = {
    "BR-CP-1940": /CÓDIGO PENAL|DECRETO-LEI Nº 2\.848/i,
    "BR-CPP-1941": /CÓDIGO DE PROCESSO PENAL|DECRETO-LEI Nº 3\.689|3\.689/i,
    "BR-LEP-1984": /LEI DE EXECUÇÃO PENAL|LEI Nº 7\.210/i,
    "BR-ECA-1990": /ESTATUTO DA CRIANÇA E DO ADOLESCENTE|LEI Nº 8\.069|8\.069/i,
    "BR-CC-2002": /CÓDIGO CIVIL|LEI Nº 10\.406/i,
    "BR-CDC-1990": /CÓDIGO DE DEFESA DO CONSUMIDOR|LEI Nº 8\.078/i,
    "BR-LMP-2006": /LEI MARIA DA PENHA|LEI Nº 11\.340|11\.340/i,
    "BR-ESTATUTO-IDOSO-2003": /ESTATUTO DA PESSOA IDOSA|LEI Nº 10\.741/i,
  };
  const expectedTitle = expectedTitles[id];
  if (expectedTitle && !expectedTitle.test(text)) {
    throw new Error("A captura não corresponde ao título oficial esperado: " + id);
  }
  if (id === "INT-UDHR-1948-PT" && (!/DECLARAÇÃO UNIVERSAL DOS DIREITOS HUMANOS/i.test(text) || !/ARTIGO\s+30\b/i.test(text))) {
    throw new Error("A captura não corresponde à DUDH completa (artigos 1 a 30).");
  }
  if (id === "INT-MANDELA-2015-PT" && !/REGRAS MÍNIMAS DAS NAÇÕES UNIDAS|REGRAS DE MANDELA/i.test(text)) {
    throw new Error("A captura não corresponde às Regras de Mandela.");
  }
}

function encodeBase64(bytes: Uint8Array) {
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return btoa(binary);
}

async function sha256(value: string | Uint8Array) {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : value;
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return response({ error: "Método não permitido." }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceKey) return response({ error: "Configuração segura do Supabase incompleta." }, 500);

  const service = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  let payload: { mode?: string; document_ids?: unknown } = {};
  try { payload = await req.json(); }
  catch { return response({ error: "Corpo JSON inválido." }, 400); }

  const cronToken = req.headers.get("x-doctor-cron-token");
  const bearer = req.headers.get("authorization") || "";
  const token = bearer.match(/^Bearer\s+(.+)$/i)?.[1];
  let triggerType: "manual" | "scheduled_daily" | "scheduled_weekly" = "manual";
  let initiatedBy = "doctor-admin";
  let requestedIds: string[] = [];

  if (cronToken) {
    const { data: cronAuthorized, error: cronError } = await service.rpc(
      "verify_legal_library_cron_token",
      { p_token: cronToken },
    );
    if (cronError || cronAuthorized !== true) return response({ error: "Token interno de agendamento inválido." }, 401);
    if (payload.mode !== "daily" && payload.mode !== "weekly") return response({ error: "Modo de agendamento inválido." }, 400);
    triggerType = payload.mode === "weekly" ? "scheduled_weekly" : "scheduled_daily";
    initiatedBy = "system:cron";
    requestedIds = Array.isArray(payload.document_ids)
      ? payload.document_ids.filter((id: unknown) => typeof id === "string").slice(0, 13)
      : [];
  } else {
    if (!token) return response({ error: "Autenticação administrativa ou token interno obrigatório." }, 401);
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: "Bearer " + token } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser(token);
    if (userError || !userData.user) return response({ error: "Sessão inválida." }, 401);
    const { data: admin, error: adminError } = await userClient.rpc("is_admin");
    if (adminError || admin !== true) return response({ error: "Apenas administradores podem iniciar a captura jurídica." }, 403);
    initiatedBy = userData.user.id;
    requestedIds = Array.isArray(payload.document_ids)
      ? payload.document_ids.filter((id: unknown) => typeof id === "string").slice(0, 13)
      : [];
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
    .insert({ trigger_type: triggerType, status: "running" })
    .select("id")
    .single();
  if (runError || !run) return response({ error: "Não foi possível iniciar o registro da captura." }, 500);

  const results: Array<Record<string, unknown>> = [];
  let changes = 0;
  let candidates = 0;
  for (const doc of selected) {
    try {
      const { data: lastVersion } = await service
        .from("legal_document_versions")
        .select("source_etag,source_last_modified,change_summary")
        .eq("document_id", doc.document_id)
        .order("source_retrieved_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      const lastSummary = (lastVersion?.change_summary || {}) as {
        source_landing_etag?: string;
        source_landing_last_modified?: string;
      };
      const dailyCheck = triggerType === "scheduled_daily";
      const landing = await fetchOfficial(doc.official_source_url, dailyCheck ? {
        etag: lastVersion?.source_etag,
        lastModified: lastVersion?.source_last_modified,
      } : {});
      if (landing.notModified) {
        results.push({ document_id: doc.document_id, status: "unchanged", check: "conditional-http-304" });
        continue;
      }
      const resolved = landing.html
        ? await resolveDocumentSource(doc, landing.html, landing.finalUrl)
        : { url: landing.finalUrl, html: undefined };
      const source = landing.normalizedText
        ? landing
        : resolved.html
          ? { ...landing, finalUrl: resolved.url }
          : await fetchOfficial(resolved.url, dailyCheck ? {
            etag: lastVersion?.source_etag,
            lastModified: lastVersion?.source_last_modified,
          } : {});
      if (source.notModified) {
        results.push({ document_id: doc.document_id, status: "unchanged", check: "conditional-http-304" });
        continue;
      }
      const extracted = source.normalizedText || extractHtml(source.html || "");
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
          source_landing_etag: landing.etag,
          source_landing_last_modified: landing.lastModified,
        },
        source_format: source.contentType.includes("pdf") ? "application/pdf" : "text/html",
        source_html: source.html || null,
        source_bytes_base64: encodeBase64(source.rawBytes),
        normalized_text: extracted,
        sha256_text: textHash,
        extraction: { method: source.contentType.includes("pdf") ? "pdfjs.getTextContent" : "DOMParser.textContent", pipeline_version: "1.1.0" },
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
            source_landing_etag: landing.etag,
            source_landing_last_modified: landing.lastModified,
            sha256_text: textHash,
            extraction_method: source.contentType.includes("pdf") ? "pdfjs.getTextContent" : "DOMParser.textContent",
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
    summary: { initiated_by: initiatedBy, trigger_type: triggerType, mode: payload.mode || "manual", results },
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
