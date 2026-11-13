update public.legal_documents
set official_source_url = case document_id
  when 'BR-CP-1940' then 'https://www2.camara.leg.br/legin/fed/declei/1940-1949/decreto-lei-2848-7-dezembro-1940-412868-norma-pe.html'
  when 'BR-CPP-1941' then 'https://www2.camara.leg.br/legin/fed/declei/1940-1949/decreto-lei-3689-3-outubro-1941-322206-norma-pe.html'
  when 'BR-LEP-1984' then 'https://www2.camara.leg.br/legin/fed/lei/1980-1987/lei-7210-11-julho-1984-356938-norma-pl.html'
  when 'BR-ECA-1990' then 'https://www2.camara.leg.br/legin/fed/lei/1990/lei-8069-13-julho-1990-372211-norma-pl.html'
  when 'BR-CC-2002' then 'https://www2.camara.leg.br/legin/fed/lei/2002/lei-10406-10-janeiro-2002-432893-norma-pl.html'
  when 'BR-CDC-1990' then 'https://www2.camara.leg.br/legin/fed/lei/1990/lei-8078-11-setembro-1990-365086-norma-pl.html'
  when 'BR-LMP-2006' then 'https://www2.camara.leg.br/legin/fed/lei/2006/lei-11340-7-agosto-2006-545133-norma-pl.html'
  when 'BR-ESTATUTO-IDOSO-2003' then 'https://www2.camara.leg.br/legin/fed/lei/2003/lei-10741-1-outubro-2003-497511-norma-pl.html'
  else official_source_url
end,
updated_at = now()
where document_id in ('BR-CP-1940', 'BR-CPP-1941', 'BR-LEP-1984', 'BR-ECA-1990', 'BR-CC-2002', 'BR-CDC-1990', 'BR-LMP-2006', 'BR-ESTATUTO-IDOSO-2003');