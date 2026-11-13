update public.legal_documents
set official_source_url = case document_id
  when 'INT-UDHR-1948-PT' then 'https://www.ohchr.org/en/UDHR/Documents/UDHR_Translations/por.pdf'
  when 'INT-MANDELA-2015-PT' then 'https://www.unodc.org/documents/justice-and-prison-reform/Nelson_Mandela_Rules-P-ebook.pdf'
  else official_source_url
end,
updated_at = now()
where document_id in ('INT-UDHR-1948-PT','INT-MANDELA-2015-PT');