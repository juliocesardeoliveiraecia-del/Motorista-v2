/* Doctor Calculator Scientific v1.12.8
 * Safe recursive-descent parser: no eval, no Function, local-only computation.
 * This file overrides the basic calculator view while preserving the Core router.
 */
(function(){
'use strict';
if(typeof Views==='undefined'||typeof UI==='undefined'||typeof DoctorCalculator==='undefined') return;
const C=DoctorCalculator;
C.expression=C.expression||'';
C.angleMode=C.angleMode||'DEG';
C.memory=Number(C.memory)||0;
C.history=Array.isArray(C.history)?C.history:[];
C.error='';
C.format=function(n){
 if(!Number.isFinite(n)) throw new Error('Resultado fora do intervalo numérico.');
 if(Object.is(n,-0)) n=0;
 return Number.parseFloat(n.toPrecision(12)).toString();
};
C.reset=function(){this.expression='';this.error='';};
C.append=function(token){
 this.error='';
 if(token==='AC'){this.reset();return;}
 if(token==='⌫'){this.expression=this.expression.slice(0,-1);return;}
 if(token==='DEG/RAD'){this.angleMode=this.angleMode==='DEG'?'RAD':'DEG';return;}
 if(token==='π'){this.expression+='pi';return;}
 if(token==='x²'){this.expression+='^2';return;}
 if(token==='xʸ'){this.expression+='^';return;}
 if(token==='x!'){this.expression+='!';return;}
 if(token==='√'){this.expression+='sqrt(';return;}
 if(token==='×'){this.expression+='*';return;}
 if(token==='÷'){this.expression+='/';return;}
 if(token==='−'){this.expression+='-';return;}
 if(token==='±'){this.expression=this.expression?' -('+this.expression+')':'-';return;}
 if(token==='Ans'){this.expression+=this.history.length?String(this.history[0].result):'';return;}
 if(token==='MR'){this.expression+=String(this.memory);return;}
 if(token==='MC'){this.memory=0;return;}
 if(token==='M+'||token==='M−'){try{this.memory+=(token==='M+'?1:-1)*this.evaluate(this.expression);}catch(e){}return;}
 if(['sin','cos','tan','asin','acos','atan','ln','log','abs','exp','sqrt'].includes(token)){this.expression+=token+'(';return;}
 if(token==='1/x'){this.expression+='1/(';return;}
 if(token==='e'){this.expression+='e';return;}
 this.expression+=token;
};
C.evaluate=function(input){
 const src=String(input||'').replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-').replace(/,/g,'.').trim();
 if(!src)throw new Error('Digite uma expressão.');
 if(src.length>220)throw new Error('Expressão muito longa.');
 const re=/\s*(?:(\d+(?:\.\d*)?|\.\d+)([eE][+-]?\d+)?|([A-Za-zπ]+)|(\*\*|[+\-*/^()%!,]))/gy;
 const ts=[];let p=0;
 while(p<src.length){re.lastIndex=p;const m=re.exec(src);if(!m)throw new Error('Expressão inválida perto de: '+src.slice(p,p+10));p=re.lastIndex;
  if(m[1]!==undefined)ts.push({t:'n',v:Number(m[1]+(m[2]||''))});
  else if(m[3])ts.push({t:'id',v:m[3].toLowerCase()});else ts.push({t:'op',v:m[4]});
  if(ts.length>180)throw new Error('Expressão muito complexa.');
 }
 let i=0;const peek=()=>ts[i];const take=()=>ts[i++];
 const angle=x=>this.angleMode==='DEG'?x*Math.PI/180:x;
 const unangle=x=>this.angleMode==='DEG'?x*180/Math.PI:x;
 const factorial=n=>{if(n<0||n>170||Math.floor(n)!==n)throw new Error('Fatorial exige inteiro entre 0 e 170.');let v=1;for(let j=2;j<=n;j++)v*=j;return v;};
 const fn=(name,x)=>{
  switch(name){
   case 'sqrt':if(x<0)throw new Error('Raiz quadrada de número negativo.');return Math.sqrt(x);
   case 'sin':return Math.sin(angle(x));case 'cos':return Math.cos(angle(x));
   case 'tan':if(Math.abs(Math.cos(angle(x)))<1e-12)throw new Error('Tangente indefinida neste ângulo.');return Math.tan(angle(x));
   case 'asin':if(Math.abs(x)>1)throw new Error('Arco-seno exige valor entre -1 e 1.');return unangle(Math.asin(x));
   case 'acos':if(Math.abs(x)>1)throw new Error('Arco-cosseno exige valor entre -1 e 1.');return unangle(Math.acos(x));
   case 'atan':return unangle(Math.atan(x));
   case 'ln':if(x<=0)throw new Error('Logaritmo natural exige valor positivo.');return Math.log(x);
   case 'log':if(x<=0)throw new Error('Logaritmo exige valor positivo.');return Math.log10(x);
   case 'abs':return Math.abs(x);case 'exp':return Math.exp(x);
   default:throw new Error('Função desconhecida: '+name);
  }
 };
 const primary=()=>{
  const t=take();if(!t)throw new Error('Expressão incompleta.');let v;
  if(t.t==='n'){v=t.v;if(!Number.isFinite(v))throw new Error('Número inválido.');}
  else if(t.t==='op'&&t.v==='('){v=expr();if(!peek()||take().v!==')')throw new Error('Falta fechar parêntese.');}
  else if(t.t==='op'&&(t.v==='+'||t.v==='-')){v=primary();if(t.v==='-')v=-v;}
  else if(t.t==='id'){
   if(t.v==='pi'||t.v==='π')v=Math.PI;else if(t.v==='e')v=Math.E;
   else if(['sqrt','sin','cos','tan','asin','acos','atan','ln','log','abs','exp'].includes(t.v)){if(!peek()||take().v!=='(')throw new Error('Use '+t.v+'(expressão).');v=fn(t.v,expr());if(!peek()||take().v!==')')throw new Error('Falta fechar parêntese da função.');}
   else throw new Error('Constante desconhecida: '+t.v);
  }else throw new Error('Esperado número, constante ou parêntese.');
  while(peek()&&peek().t==='op'&&(peek().v==='!'||peek().v==='%')){const op=take().v;v=op==='!'?factorial(v):v/100;}
  return v;
 };
 const power=()=>{let v=primary();if(peek()&&peek().t==='op'&&(peek().v==='^'||peek().v==='**')){take();v=Math.pow(v,unary());}return v;};
 const unary=()=>{if(peek()&&peek().t==='op'&&(peek().v==='+'||peek().v==='-')){const op=take().v;return op==='-'?-unary():unary();}return power();};
 const term=()=>{let v=unary();while(peek()&&peek().t==='op'&&['*','/'].includes(peek().v)){const op=take().v,b=unary();if(op==='/'&&b===0)throw new Error('Divisão por zero.');v=op==='*'?v*b:v/b;}return v;};
 const expr=()=>{let v=term();while(peek()&&peek().t==='op'&&['+','-'].includes(peek().v)){const op=take().v,b=term();v=op==='+'?v+b:v-b;}return v;};
 const result=expr();if(i!==ts.length)throw new Error('Verifique operadores e parênteses.');if(!Number.isFinite(result))throw new Error('Resultado fora do intervalo numérico.');return result;
};
C.calculate=function(){
 try{const n=this.evaluate(this.expression);const result=this.format(n);this.history.unshift({expression:this.expression,result,at:Date.now()});this.history=this.history.slice(0,12);this.expression=result;this.error='';return true;}
 catch(e){this.error=e.message||'Não foi possível calcular.';return false;}
};
Views.calculator=function(){
 const keys=[
 ['AC','utility'],['⌫','utility'],['(', 'utility'],[')','utility'],['DEG/RAD','utility'],
 ['sin','science'],['cos','science'],['tan','science'],['√','science'],['x²','science'],
 ['asin','science'],['acos','science'],['atan','science'],['log','science'],['ln','science'],
 ['7',''],['8',''],['9',''],['÷','operator'],['xʸ','science'],
 ['4',''],['5',''],['6',''],['×','operator'],['x!','science'],
 ['1',''],['2',''],['3',''],['−','operator'],['π','science'],
 ['±','utility'],['0',''],['.',''],['+','operator'],['e','science'],
 ['%','utility'],['1/x','science'],['Ans','science'],['M+','utility'],['=','equals']
 ];
 const hist=C.history.slice(0,5);
 return '<section class="calculator-page"><div class="calculator-heading"><button class="btn btn-ghost btn-sm" id="calculator-back">← Voltar aos estudos</button><span class="calculator-badge">CIENTÍFICA · OFFLINE</span></div><div class="calculator-intro"><div class="calculator-mark">🧮</div><div><span class="eyebrow">FERRAMENTA DE ESTUDO</span><h2>Calculadora Doctor</h2><p>Expressões, fórmulas numéricas e funções científicas — sem internet.</p></div></div><div class="calculator-shell card"><label class="calculator-expression-label" for="calculator-expression">Expressão matemática</label><input id="calculator-expression" class="calculator-expression" inputmode="decimal" autocomplete="off" spellcheck="false" placeholder="Ex.: (12 + 8) × 3^2" value="'+C.expression.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;')+'"><div class="calculator-screen"><div class="calculator-context" id="calculator-context">'+C.angleMode+' · constantes π e e</div><output class="calculator-display" id="calculator-display" aria-live="polite">'+(C.expression||'0')+'</output><div id="calculator-error" class="calculator-error" role="status">'+C.error+'</div></div><div class="calculator-keys scientific-keys" role="group" aria-label="Teclado científico">'+keys.map(x=>'<button type="button" class="calc-key '+x[1]+'" data-calc-key="'+x[0]+'" aria-label="'+x[0]+'">'+x[0]+'</button>').join('')+'</div><div class="calculator-memory"><button type="button" class="calc-memory" data-calc-key="MC">MC</button><button type="button" class="calc-memory" data-calc-key="MR">MR</button><button type="button" class="calc-memory" data-calc-key="M−">M−</button><span id="calculator-memory-label">Memória: '+C.format(C.memory)+'</span></div><div class="calculator-footnote"><span class="calc-status-dot"></span> Cálculos locais · sem internet · sem execução de código</div>'+(hist.length?'<div class="calculator-history"><h3>Histórico recente</h3>'+hist.map(h=>'<button type="button" class="calculator-history-item" data-calc-history="'+encodeURIComponent(h.expression)+'"><span>'+h.expression.replace(/</g,'&lt;')+'</span><strong>'+h.result+'</strong></button>').join('')+'</div>':'')+'</div></section>';
};
Views.bind.calculator=function(){
 document.getElementById('calculator-back')?.addEventListener('click',()=>UI.back());
 const refresh=()=>{const input=document.getElementById('calculator-expression'),display=document.getElementById('calculator-display'),ctx=document.getElementById('calculator-context'),err=document.getElementById('calculator-error');if(input&&input.value!==C.expression)input.value=C.expression;if(display)display.textContent=C.expression||'0';if(ctx)ctx.textContent=C.angleMode+' · constantes π e e';if(err)err.textContent=C.error;const mem=document.getElementById('calculator-memory-label');if(mem)mem.textContent='Memória: '+C.format(C.memory);};
 const input=document.getElementById('calculator-expression');
 input?.addEventListener('input',()=>{C.expression=input.value;C.error='';refresh();});
 document.querySelectorAll('[data-calc-key]').forEach(btn=>btn.addEventListener('click',()=>{const key=btn.dataset.calcKey;if(key==='='){if(C.calculate())UI.render('calculator');else refresh();return;}C.append(key);refresh();}));
 document.querySelectorAll('[data-calc-history]').forEach(btn=>btn.addEventListener('click',()=>{try{C.expression=decodeURIComponent(btn.dataset.calcHistory);C.error='';refresh();input?.focus();}catch(e){}}));
 const onKey=e=>{if(UI.currentView!=='calculator'||/^(INPUT|TEXTAREA)$/.test(e.target?.tagName||''))return;const map={'*':'×','/':'÷','-':'−','Enter':'=','=':'=','Backspace':'⌫','Escape':'AC'};const k=map[e.key]||e.key;if(/^\d$/.test(k)||['.','(',')','+','−','×','÷','^','%','=','⌫','AC'].includes(k)){e.preventDefault();if(k==='='){if(C.calculate())UI.render('calculator');else refresh();}else{C.append(k);refresh();}}};
 window.addEventListener('keydown',onKey);UI._calculatorKeyCleanup=()=>window.removeEventListener('keydown',onKey);
};
})();