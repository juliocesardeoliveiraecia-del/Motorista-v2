/* Doctor Core Icon Generator — matriz única para todos os produtos.
 * Uso: DoctorIconSystem.render({ appId, productId, appTitle, label, badgeColor })
 * Não altera a lógica do aplicativo.
 */
(function(global){
 'use strict';
 const PALETTE = [{"id":"yellow","color":"#F5C400","textColor":"#071322"},{"id":"green","color":"#20B86B","textColor":"#FFFFFF"},{"id":"red","color":"#E53935","textColor":"#FFFFFF"},{"id":"purple","color":"#8B5CF6","textColor":"#FFFFFF"},{"id":"blue","color":"#1687FF","textColor":"#FFFFFF"},{"id":"orange","color":"#F97316","textColor":"#FFFFFF"},{"id":"cyan","color":"#06B6D4","textColor":"#071322"},{"id":"pink","color":"#EC4899","textColor":"#FFFFFF"}];
 const BASE = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1024\" height=\"1024\" viewBox=\"0 0 1024 1024\" role=\"img\" aria-labelledby=\"title\">\n<title id=\"title\">__TITLE__</title>\n<defs>\n <linearGradient id=\"bg\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop offset=\"0\" stop-color=\"#07101f\"/><stop offset=\".55\" stop-color=\"#06152c\"/><stop offset=\"1\" stop-color=\"#020711\"/></linearGradient>\n <linearGradient id=\"blue\" x1=\".12\" y1=\"0\" x2=\".92\" y2=\"1\"><stop offset=\"0\" stop-color=\"#23c9ff\"/><stop offset=\".24\" stop-color=\"#087cf4\"/><stop offset=\".6\" stop-color=\"#0750c8\"/><stop offset=\"1\" stop-color=\"#041d5c\"/></linearGradient>\n <linearGradient id=\"bluePage\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop offset=\"0\" stop-color=\"#30d9ff\"/><stop offset=\".5\" stop-color=\"#087cf4\"/><stop offset=\"1\" stop-color=\"#053b9d\"/></linearGradient>\n <linearGradient id=\"white\" x1=\"0\" y1=\"0\" x2=\".8\" y2=\"1\"><stop offset=\"0\" stop-color=\"#fff\"/><stop offset=\"1\" stop-color=\"#d9e8ff\"/></linearGradient>\n <filter id=\"shadow\" x=\"-20%\" y=\"-20%\" width=\"140%\" height=\"150%\"><feGaussianBlur stdDeviation=\"18\"/></filter>\n</defs>\n<rect width=\"1024\" height=\"1024\" rx=\"150\" fill=\"url(#bg)\"/>\n<ellipse cx=\"520\" cy=\"840\" rx=\"340\" ry=\"40\" fill=\"#000\" opacity=\".55\" filter=\"url(#shadow)\"/>\n<path d=\"M286 164 H600 C779 164 900 304 900 489 C900 674 777 815 590 815 H286 Z M410 299 V680 H588 C698 680 764 604 764 489 C764 377 698 299 588 299 Z\" fill=\"url(#blue)\" fill-rule=\"evenodd\"/>\n<path d=\"M292 170 H600 C773 170 892 306 892 489\" fill=\"none\" stroke=\"#64eaff\" stroke-width=\"8\" opacity=\".8\"/>\n<path d=\"M182 444 C263 458 338 496 408 572 L408 815 C335 751 261 719 182 708 Z\" fill=\"url(#bluePage)\" stroke=\"#7be8ff\" stroke-width=\"7\"/>\n<path d=\"M182 444 C270 455 342 495 408 572 L408 815 C344 749 266 720 182 708 Z\" fill=\"none\" stroke=\"#eaf9ff\" stroke-width=\"9\"/>\n<path d=\"M408 572 C476 514 559 483 654 472 L754 435 L707 515 C597 552 493 630 408 815 Z\" fill=\"url(#white)\" stroke=\"#fff\" stroke-width=\"5\" stroke-linejoin=\"round\"/>\n<path d=\"M408 815 C365 755 292 722 182 708 L182 444 C279 462 350 507 408 572\" fill=\"none\" stroke=\"#fff\" stroke-width=\"10\" stroke-linejoin=\"round\"/>\n<path d=\"M400 808 C459 704 529 651 617 612 C690 579 744 528 796 450 L748 425 L854 352 L835 475 L811 453 C757 548 697 610 615 654 C539 695 483 744 444 818 Z\" fill=\"url(#white)\" stroke=\"#dff6ff\" stroke-width=\"7\" stroke-linejoin=\"round\"/>\n\n</svg>";
 const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 function render(config={}){
   const title=esc(config.appTitle || 'Doctor Concursos');
   const color=config.badgeColor || (PALETTE.find(p=>p.id===config.color)?.color) || '#F5C400';
   const textColor=config.badgeTextColor || (PALETTE.find(p=>p.color===color)?.textColor) || '#071322';
   const svg=BASE.replace('__TITLE__',title);
   const badge='<g id="product-badge"><path d="M650 0 H1024 V374 Z" fill="#F5C400" stroke="#ffffff" stroke-opacity=".92" stroke-width="10" stroke-linejoin="round"/><path d="M650 0 L1024 374" fill="none" stroke="#ffffff" stroke-opacity=".3" stroke-width="7"/></g>';
   return svg.replace('</svg>',badge+'</svg>');
 }
 function apply(config={}){
   const svg=render(config);
   const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));
   document.querySelectorAll('link[rel="icon"],link[rel="apple-touch-icon"]').forEach(link=>{link.href=url;});
   document.querySelectorAll('[data-doctor-app-icon]').forEach(el=>{el.src=url;el.alt=config.appTitle||'Doctor Concursos';});
   return {svg,url};
 }
 global.DoctorIconSystem={render,apply,palette:PALETTE,version:'1.3.0'};
})(window);
