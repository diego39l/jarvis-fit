import React, {useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Activity,CalendarDays,Utensils,ChartNoAxesCombined,Plus,CheckCircle2,Download,Upload} from 'lucide-react';
import './style.css';
import EvolutionDashboard from './EvolutionDashboard';

type Kind = 'Corrida'|'CrossFit'|'Recuperação';
type Session = {id:string;date:string;kind:Kind;title:string;detail:string;minutes:number;rpe?:number;done?:boolean;actualMinutes?:number;distanceKm?:number;wodResult?:string;completedAt?:string};
type Meal = {id:string;date:string;name:string;description:string};
type State = {sessions:Session[];meals:Meal[];fatigue:number;soreness:number;notes:string};
const localISO=(d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const today=()=>localISO(new Date());
const day=(offset:number)=>{const d=new Date();d.setDate(d.getDate()+offset);return localISO(d)};
const uid=()=>crypto.randomUUID();
const plan:[Kind,string,string,number][]=[
 ['CrossFit','Força + técnica','Agachamento ou levantamento com técnica controlada; WOD moderado de 10–15 min.',55],
 ['Corrida','Corrida fácil','30–40 min em ritmo de conversa, sem buscar recorde.',35],
 ['CrossFit','Ginástica + condicionamento','Técnica de movimentos e WOD sem falha muscular.',50],
 ['Corrida','Intervalos controlados','10 min leve + 5 × 2 min forte / 2 min leve + 10 min leve.',40],
 ['CrossFit','Força + core','Força de membros superiores e core; reduzir volume de pernas.',50],
 ['Corrida','Corrida longa fácil','45–65 min em ritmo confortável, conforme recuperação.',55],
 ['Recuperação','Descanso ativo','Mobilidade leve ou caminhada; descanso completo se necessário.',20]
];
const makeInitial=():State=>({sessions:Array.from({length:7},(_,i)=>({id:uid(),date:day(i),kind:plan[i][0],title:plan[i][1],detail:plan[i][2],minutes:plan[i][3]})),meals:[],fatigue:3,soreness:2,notes:''});
const dbName='jarvis-fit-v1',storeName='state';
async function openDB():Promise<IDBDatabase>{return new Promise((res,rej)=>{const r=indexedDB.open(dbName,1);r.onupgradeneeded=()=>r.result.createObjectStore(storeName);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
async function load():Promise<State|null>{const db=await openDB();return new Promise((res,rej)=>{const r=db.transaction(storeName).objectStore(storeName).get('main');r.onsuccess=()=>res(r.result??null);r.onerror=()=>rej(r.error)})}
async function save(s:State){const db=await openDB();return new Promise<void>((res,rej)=>{const tx=db.transaction(storeName,'readwrite');tx.objectStore(storeName).put(s,'main');tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error)})}
const actualMinutes=(s:Session)=>s.actualMinutes??s.minutes;
const pace=(s:Session)=>s.distanceKm&&s.distanceKm>0&&actualMinutes(s)>0?(()=>{const m=actualMinutes(s)/s.distanceKm;return `${Math.floor(m)}:${String(Math.round((m%1)*60)).padStart(2,'0')}`})():null;
const readiness=(fatigue:number,soreness:number,session:Session)=>{
 const score=Math.max(fatigue,soreness);
 if(session.kind==='Recuperação')return {level:'normal',title:'Recuperação planejada',detail:'Caminhada leve ou descanso, conforme disposição.',minutes:session.minutes};
 if(score>=7)return {level:'red',title:'Trocar por recuperação',detail:'Sugestão: descanso ou mobilidade leve. Evite corrida intensa e WOD. Se a dor for aguda, interrompa e procure avaliação.',minutes:0};
 if(score>=5)return {level:'yellow',title:'Reduzir intensidade',detail:'Sugestão: reduzir o volume planejado em aproximadamente 30%, manter esforço leve e evitar máximas.',minutes:Math.max(15,Math.round(session.minutes*0.7))};
 return {level:'normal',title:'Treino conforme planejado',detail:'Mantenha a intensidade planejada e reavalie após o aquecimento.',minutes:session.minutes};
};
const suggestions=[['Café da manhã','Ovos, pão integral e uma fruta'],['Almoço','Arroz, feijão, frango ou tofu e legumes'],['Pré-treino','Banana e iogurte (ajuste ao horário e tolerância)'],['Jantar','Batata ou arroz, peixe ou leguminosas e verduras']];
function App(){
 const [state,setState]=useState<State|null>(null),[tab,setTab]=useState('Hoje'),[mealName,setMealName]=useState(''),[mealDesc,setMealDesc]=useState(''),[importError,setImportError]=useState('');
 useEffect(()=>{load().then(s=>setState(s??makeInitial())).catch(()=>setImportError('Armazenamento indisponível neste navegador.'))},[]);
 useEffect(()=>{if(state)save(state).catch(()=>setImportError('Não foi possível salvar os dados.'))},[state]);
 if(!state)return <main>Carregando Jarvis Fit…</main>;
 const update=(fn:(s:State)=>State)=>setState(prev=>prev?fn(prev):prev);
 const high=state.fatigue>=7||state.soreness>=7;
 const completed=state.sessions.filter(s=>s.done).length;
 const doneSessions=state.sessions.filter(s=>s.done);
 const totalMinutes=doneSessions.reduce((a,s)=>a+actualMinutes(s),0);
 const totalKm=doneSessions.reduce((a,s)=>a+(s.kind==='Corrida'?(s.distanceKm??0):0),0);
 const lastRun=doneSessions.filter(s=>s.kind==='Corrida'&&s.distanceKm).slice(-1)[0];
 const todays=state.sessions.filter(s=>s.date===today());
 const addMeal=(name:string,description:string)=>update(s=>({...s,meals:[...s.meals,{id:uid(),date:today(),name,description}]}));
 const exportData=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));a.download='jarvis-fit-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
 const importData=async(f?:File)=>{if(!f)return;try{const v=JSON.parse(await f.text());if(!v||!Array.isArray(v.sessions)||!Array.isArray(v.meals)||!Number.isInteger(v.fatigue)||v.fatigue<0||v.fatigue>10||!Number.isInteger(v.soreness)||v.soreness<0||v.soreness>10||typeof v.notes!=='string'||v.sessions.length>10000||v.meals.length>10000||!v.sessions.every((x:Session)=>typeof x.id==='string'&&typeof x.date==='string'&&typeof x.title==='string'&&typeof x.detail==='string'&&Number.isFinite(x.minutes)&&['Corrida','CrossFit','Recuperação'].includes(x.kind))||!v.meals.every((x:Meal)=>typeof x.id==='string'&&typeof x.date==='string'&&typeof x.name==='string'&&typeof x.description==='string'))throw Error();if(confirm('Substituir os dados atuais pelo backup?'))setState(v);setImportError('')}catch{setImportError('Arquivo de backup inválido.')}};
 return <div className="shell"><header><div className="brand"><span className="brandIcon">J</span><div><strong>JARVIS <em>FIT</em></strong><small>SEU COACH PESSOAL</small></div></div><span className="tag">100% OFFLINE</span></header><main><div className="eyebrow">TREINAMENTO HÍBRIDO · INTERMEDIÁRIO</div><h1>{tab==='Hoje'?'Seu progresso começa aqui':tab}</h1><p className="muted">Corrida, CrossFit e alimentação no mesmo lugar.</p>
 {tab==='Hoje'&&<><section className="homeHero" aria-label="Resumo do seu desempenho"><div className="eyebrow">PAINEL DO ATLETA</div><h2>Seu treino, sua evolução.</h2><p className="muted">Acompanhe o que você já conquistou e prepare o próximo treino.</p><div className="homeMetrics"><div><span>Distância corrida</span><strong>{totalKm.toFixed(2)} <small>km</small></strong></div><div><span>Tempo treinado</span><strong>{totalMinutes} <small>min</small></strong></div><div><span>Treinos concluídos</span><strong>{completed}<small> / {state.sessions.length}</small></strong></div></div><button className="primary" onClick={()=>setTab('Evolução')}>Ver minha evolução <ChartNoAxesCombined size={17}/></button></section><section><h2>Últimas atividades</h2>{doneSessions.length?doneSessions.slice().sort((a,b)=>(b.completedAt??b.date).localeCompare(a.completedAt??a.date)).slice(0,3).map(s=><article className="activityItem" key={s.id}><div><b>{s.kind} · {s.title}</b><p className="muted">{s.date} · {actualMinutes(s)} min{s.kind==='Corrida'&&s.distanceKm?' · '+s.distanceKm.toFixed(2)+' km':''}</p></div><CheckCircle2 size={20} aria-label="Concluído"/></article>):<p className="muted">Quando você concluir um treino, ele aparecerá aqui.</p>}<button className="secondary" onClick={()=>setTab('Evolução')}>Consultar histórico e indicadores</button></section><section><h2>Prontidão para treinar</h2><div className="sliders"><label>Fadiga percebida <b>{state.fatigue}/10</b><input type="range" min="0" max="10" value={state.fatigue} onChange={e=>update(s=>({...s,fatigue:+e.target.value}))}/></label><label>Dor muscular <b>{state.soreness}/10</b><input type="range" min="0" max="10" value={state.soreness} onChange={e=>update(s=>({...s,soreness:+e.target.value}))}/></label></div><p className={high?'alert':'tip'}>{high?'Recuperação prioritária: evite intervalados, cargas máximas e WOD intenso. Considere descanso e avalie dores persistentes.':'Prontidão razoável: siga o planejamento, ajustando o esforço ao aquecimento e ao seu estado real.'}</p></section><section><h2>Treino de hoje</h2>{todays.length?todays.map(s=><Workout key={s.id} session={s} fatigue={state.fatigue} soreness={state.soreness} onDone={entry=>update(x=>({...x,sessions:x.sessions.map(y=>y.id===s.id?{...y,done:true,...entry,completedAt:new Date().toISOString()}:y)}))}/>):<p className="muted">Sem treino previsto hoje. Consulte o calendário.</p>}</section><section><h2>Refeições sugeridas</h2>{suggestions.slice(0,2).map(([name,desc])=><div className="meal" key={name}><div><b>{name}</b><p>{desc}</p></div><button onClick={()=>addMeal(name,desc)}>Registrar</button></div>)}</section></>}
 {tab==='Treinos'&&<><section><h2>Plano inicial de 7 dias</h2><p className="muted">Plano orientativo. Altere a carga se houver fadiga, dor ou conflito com o WOD do box.</p>{state.sessions.map(s=><Workout key={s.id} session={s} fatigue={state.fatigue} soreness={state.soreness} onDone={entry=>update(x=>({...x,sessions:x.sessions.map(y=>y.id===s.id?{...y,done:true,...entry,completedAt:new Date().toISOString()}:y)}))}/>)}</section><section><h2>Próxima semana</h2><button className="primary" onClick={()=>update(s=>{const last=s.sessions.reduce((m,x)=>x.date>m?x.date:m,today());const start=new Date(`${last}T12:00:00`);return {...s,sessions:[...s.sessions,...plan.map((p,i)=>{const d=new Date(start);d.setDate(d.getDate()+i+1);return {id:uid(),date:localISO(d),kind:p[0],title:p[1],detail:p[2],minutes:p[3]}})]}})}>Adicionar mais 7 dias <Plus size={16}/></button><p className="muted">Adiciona sete dias após a última data planejada, sem sobrepor semanas.</p></section></>}
 {tab==='Alimentação'&&<><section><h2>Alimentação e recuperação</h2><p className={high?'alert':'tip'}>{high?'Dia de recuperação: mantenha refeições regulares e hidratação. Não restrinja energia para compensar o descanso.':'Dias de corrida e CrossFit: distribua refeições e inclua fontes de carboidratos e proteínas conforme tolerância e rotina.'}</p></section><section><h2>Ideias para o dia</h2><p className="muted">Sem metas calóricas automáticas. Ajuste quantidades às suas necessidades com orientação profissional quando necessário.</p>{suggestions.map(([name,desc])=><div className="meal" key={name}><div><b>{name}</b><p>{desc}</p></div><button onClick={()=>addMeal(name,desc)}>+ Registrar</button></div>)}</section><section><h2>Adicionar refeição</h2><input placeholder="Refeição" value={mealName} onChange={e=>setMealName(e.target.value)}/><input placeholder="Alimentos e quantidades (opcional)" value={mealDesc} onChange={e=>setMealDesc(e.target.value)}/><button className="primary" disabled={!mealName.trim()} onClick={()=>{addMeal(mealName,mealDesc);setMealName('');setMealDesc('')}}>Salvar refeição</button></section><section><h2>Registro alimentar</h2>{state.meals.length?state.meals.slice().reverse().map(m=><div className="meal" key={m.id}><div><b>{m.name}</b><p>{m.date} · {m.description}</p></div><button onClick={()=>update(s=>({...s,meals:s.meals.filter(x=>x.id!==m.id)}))}>Excluir</button></div>):<p className="muted">Nenhuma refeição registrada.</p>}</section></>}
 {tab==='Evolução'&&<><EvolutionDashboard sessions={state.sessions}/><section><h2>Resumo</h2><p>Treinos realizados: <b>{completed}</b></p><p>Tempo total: <b>{totalMinutes} min</b></p><p>Distância corrida registrada: <b>{totalKm.toFixed(2)} km</b></p><p>Último ritmo registrado: <b>{lastRun?pace(lastRun)+' min/km':'—'}</b></p><p>Refeições registradas: <b>{state.meals.length}</b></p><p>Esforço médio: <b>{completed?(state.sessions.filter(s=>s.done).reduce((a,s)=>a+(s.rpe??0),0)/completed).toFixed(1):'—'}/10</b></p></section><section><h2>Progresso para 10 km</h2><p className="muted">Distância total registrada não equivale à maior corrida contínua.</p><p>Maior corrida registrada: <b>{Math.max(0,...doneSessions.filter(s=>s.kind==='Corrida').map(s=>s.distanceKm??0)).toFixed(2)} km / 10 km</b></p><div className="progress"><div style={{width:`${Math.min(100,Math.max(0,...doneSessions.filter(s=>s.kind==='Corrida').map(s=>s.distanceKm??0))*10)}%`}}/></div><p className="muted">O progresso é informativo, não uma prescrição de aumento semanal de volume.</p></section><section><h2>Seus dados</h2><p className="muted">Os dados ficam neste dispositivo. Exporte backups periodicamente, especialmente antes de limpar o navegador.</p><button className="primary" onClick={exportData}><Download size={16}/> Exportar backup JSON</button><label className="file"><Upload size={16}/> Importar backup<input type="file" accept="application/json,.json" onChange={e=>importData(e.target.files?.[0])}/></label>{importError&&<p className="alert">{importError}</p>}</section><section><h2>Sobre a adaptação</h2><p className="muted">Fadiga ou dor muscular de 5–6/10 sugere redução de volume; ≥ 7/10 sugere recuperação em vez do treino intenso. A alteração é uma recomendação exibida antes do registro, não modifica permanentemente o plano. Não é diagnóstico nem substitui avaliação clínica. Dor aguda ou incomum exige interromper a atividade.</p></section></>}
 </main><nav>{[['Hoje',Activity],['Treinos',CalendarDays],['Alimentação',Utensils],['Evolução',ChartNoAxesCombined]].map(([name,Icon])=><button key={name as string} className={tab===name?'active':''} onClick={()=>setTab(name as string)}><Icon size={21}/><span>{name as string}</span></button>)}</nav></div>
}
function Workout({session:s,fatigue,soreness,onDone}:{session:Session;fatigue:number;soreness:number;onDone:(entry:{rpe:number;actualMinutes:number;distanceKm?:number;wodResult?:string})=>void}){
 const [rpe,setRpe]=useState(5);
 const [minutes,setMinutes]=useState(String(s.minutes));
 const [km,setKm]=useState('');
 const [result,setResult]=useState('');
 const [confirmOverride,setConfirmOverride]=useState(false);
 const guidance=readiness(fatigue,soreness,s);
 return <WorkoutDetails session={s} onDone={onDone} rpe={rpe} setRpe={setRpe} minutes={minutes} setMinutes={setMinutes} km={km} setKm={setKm} result={result} setResult={setResult} confirmOverride={confirmOverride} setConfirmOverride={setConfirmOverride} guidance={guidance}/>;
}
function WorkoutDetails({session:s,onDone,rpe,setRpe,minutes,setMinutes,km,setKm,result,setResult,confirmOverride,setConfirmOverride,guidance}:{
 session:Session;onDone:(entry:{rpe:number;actualMinutes:number;distanceKm?:number;wodResult?:string})=>void;
 rpe:number;setRpe:(n:number)=>void;minutes:string;setMinutes:(v:string)=>void;km:string;setKm:(v:string)=>void;
 result:string;setResult:(v:string)=>void;confirmOverride:boolean;setConfirmOverride:(v:boolean)=>void;
 guidance:ReturnType<typeof readiness>;
}){
 const duration=Number(minutes),distance=Number(km.replace(',','.'));
 const valid=Number.isFinite(duration)&&duration>=0&&duration<=1440&&(s.kind!=='Corrida'||!km||(Number.isFinite(distance)&&distance>0&&distance<=200));
 const red=guidance.level==='red';
 return <article className="workout"><div className="workoutTop"><span className="kind">{s.kind}</span><span className="date">{s.date}</span></div><h3>{s.title}</h3><p>{s.detail}</p><p className={red?'alert':guidance.level==='yellow'?'tip':'muted'}><b>{guidance.title}.</b> {guidance.detail}{guidance.level==='yellow'?' Duração sugerida: '+guidance.minutes+' min.':''}</p>
 {s.done?<p className="done"><CheckCircle2 size={16}/> Feito · {actualMinutes(s)} min · RPE {s.rpe}{s.distanceKm?' · '+s.distanceKm.toFixed(2)+' km · '+pace(s)+' min/km':''}{s.wodResult?' · '+s.wodResult:''}</p>:
 <div className="logForm"><label>Duração real (min)<input type="number" min="0" max="1440" value={minutes} onChange={e=>setMinutes(e.target.value)}/></label>
 {s.kind==='Corrida'&&<label>Distância (km)<input type="number" min="0" max="200" step="0.01" placeholder="Ex.: 5.20" value={km} onChange={e=>setKm(e.target.value)}/></label>}
 {s.kind==='CrossFit'&&<label>Resultado do WOD / carga<input type="text" maxLength={180} placeholder="Ex.: 5 rounds, agachamento 60 kg" value={result} onChange={e=>setResult(e.target.value)}/></label>}
 <label>Esforço percebido (RPE) <select value={rpe} onChange={e=>setRpe(+e.target.value)}>{Array.from({length:10},(_,i)=><option key={i+1}>{i+1}</option>)}</select></label>
 {red&&<label className="consent"><input type="checkbox" checked={confirmOverride} onChange={e=>setConfirmOverride(e.target.checked)}/> Registrei atividade apesar do alerta de recuperação.</label>}
 <button disabled={!valid||(red&&!confirmOverride)} onClick={()=>onDone({rpe,actualMinutes:duration,...(s.kind==='Corrida'&&km?{distanceKm:distance}:{}),...(s.kind==='CrossFit'&&result.trim()?{wodResult:result.trim()}: {})})}>Registrar treino realizado</button>
 </div>}
 </article>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
