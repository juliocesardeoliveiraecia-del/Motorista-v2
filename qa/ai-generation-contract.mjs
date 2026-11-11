import fs from 'node:fs';
import vm from 'node:vm';

const index=fs.readFileSync('index.html','utf8');
const start=index.indexOf('  async generateQuestions(subjectId, count=10, options={}) {');
const end=index.indexOf('\n  _buildFlashcardPrompt(',start);
if(start<0||end<0)throw new Error('generateQuestions implementation not found');
const methodSource=index.slice(start,end).trim().replace(/,$/, '');

function must(label,condition){if(!condition)throw new Error('FAIL: '+label);console.log('PASS:',label);}
must('Question generation has an explicit completion-token budget',methodSource.includes('maxTokens:tokenBudget')&&methodSource.includes('remaining*1800'));
must('Question review has an explicit completion-token budget',index.includes('async reviewQuestions(questions,subject,{maxTokens=null}={})')&&index.includes('maxTokens:maxTokens||Math.min(24000'));
must('Question generation retries partial or rejected batches before returning',methodSource.includes('round<4')&&methodSource.includes('pending.length<targetCount'));
must('Question generation does not persist a partial batch',methodSource.indexOf('if(pending.length!==targetCount)')<methodSource.indexOf('pending.forEach(q=>{QUESTIONS.push(q)'));
must('Practice actions request ten new questions and use the actual button target',index.includes('GroqAI.generateQuestions(targetSubject,10)')&&index.includes('e=>generate(e.currentTarget,true)')&&index.includes('e=>generate(e.currentTarget,false)'));
must('No always-visible generate button is offered while the student is answering available questions',!index.includes('id="q-generate-subject"'));
must('Generation handler blocks requests while fresh questions remain',index.includes("if(Quiz.hasMoreFresh(subjectId)){UI.toast('Conclua todas as questões disponíveis desta matéria antes de gerar mais."));
must('Generation remains available only at the exhausted-bank states',index.includes('id="q-generate-more"')&&index.includes('id="q-generate-inline"')&&index.includes('const needsMoreToAdvance = isFrontier && !Quiz.hasMoreFresh(subjectId);'));
must('All four contest subjects remain configured for the shared practice flow', ['portugues','rlm','realidade','especificos'].every(id=>fs.readFileSync('product-content.js','utf8').includes("id: '"+id+"'")));
must('Simulado preserves the official per-subject distribution and has enough bounded batches',index.includes('Math.ceil(target/10)+1')&&index.includes('counts[s.id]!==s.officialQuestions'));
must('Simulado quota is consumed only after full proof preparation',index.indexOf('const prepared=Quiz.prepareSimulado(result.questions)')<index.indexOf('nextAllowedAt:completedAt+7*86400000'));
must('Simulado failures explain generation and review failures without accepting partial proof',index.includes("'review-unavailable':")&&index.includes("'output-truncated':")&&index.includes("'incomplete-generation':"));

function makeHarness(alwaysReturnTwo=false){
  const questions=[],saved=[];
  let calls=0;
  const sandbox={
    GroqAI:{getKey:()=> 'test-key'},
    SUBJECTS:[{id:'mat',name:'Matemática',topics:['tema']}],
    Quiz:{poolFor:()=>[],shuffle:a=>a.slice()},
    QUESTIONS:questions,
    Store:{state:{aiQuestions:saved},save(){}},
    DoctorQuestionIntegrity:{auditBank(){}},
    EXAM_CONFIG:{aiProfile:{revisionRequired:true,formatEvidenceVerified:true}},
    ExamRules:{optionCount:4},
    DoctorAICore:{
      context:()=> 'contexto',
      parseJSON:text=>JSON.parse(text),
      questionSchema:(count)=>({properties:{questions:{description:'Gere exatamente '+count+' questões completas, nem menos nem mais.'}}}),
      call:async({responseFormat})=>{
        calls++;
        const requested=Number(responseFormat.json_schema.schema.properties.questions.description.match(/exatamente (\d+)/)?.[1]||10);
        const n=alwaysReturnTwo?Math.min(2,requested):Math.min(calls===1?2:requested,requested);
        return {ok:true,model:'mock',content:JSON.stringify({questions:Array.from({length:n},(_,i)=>({
          text:'Enunciado válido de teste número '+calls+' questão '+i+' com conteúdo suficiente.',
          options:['Alternativa A '+calls+' '+i,'Alternativa B '+calls+' '+i,'Alternativa C '+calls+' '+i,'Alternativa D '+calls+' '+i],
          correct:0,explanations:['Explicação A','Explicação B','Explicação C','Explicação D']
        }))}),data:{choices:[{finish_reason:'stop'}]}};
      },
      reviewQuestions:async(batch)=>({ok:true,questions:batch.map(q=>({...q,reviewedByDoctor:true,reviewStatus:'APROVAR'}))})
    }
  };
  const generator=vm.runInNewContext('({'+methodSource+'})',sandbox);
  generator.getKey=()=> 'test-key';
  generator._inFlight=new Map();
  generator._buildPrompt=()=> 'prompt';
  generator._validateAndTag=(raw,subjectId)=>raw.map((q,i)=>({...q,id:subjectId+'-'+calls+'-'+i,subjectId,aiGenerated:true}));
  return {generator,sandbox,questions,saved,getCalls:()=>calls};
}

const good=makeHarness(false);
const result=await good.generator.generateQuestions('mat',10);
must('A partial AI response is topped up to exactly ten reviewed questions',result.ok&&result.added===10&&good.questions.length===10&&good.saved.length===10&&good.getCalls()===2);

const partial=makeHarness(true);
const failed=await partial.generator.generateQuestions('mat',10);
must('A persistently short response fails safely and never saves a partial batch',!failed.ok&&failed.generated<10&&partial.questions.length===0&&partial.saved.length===0);

console.log('AI GENERATION CONTRACT: OK');
