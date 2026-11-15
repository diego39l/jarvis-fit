import React,{useMemo,useState} from 'react';
import {CheckCircle2} from 'lucide-react';
import {pace as formatPace} from './evolutionMetrics';

export type HistorySession={id:string;date:string;kind:string;title:string;minutes:number;actualMinutes?:number;distanceKm?:number;done?:boolean;completedAt?:string;rpe?:number};
const duration=(s:HistorySession)=>s.actualMinutes??s.minutes;
export default function ActivityHistory({sessions}:{sessions:HistorySession[]}){
 const [kind,setKind]=useState('Todas');
 const [period,setPeriod]=useState('Tudo');
 const [query,setQuery]=useState('');
 const entries=useMemo(()=>{
  const cutoff=new Date();
  if(period==='7 dias')cutoff.setDate(cutoff.getDate()-6);
  if(period==='30 dias')cutoff.setDate(cutoff.getDate()-29);
  const minimum=`${cutoff.getFullYear()}-${String(cutoff.getMonth()+1).padStart(2,'0')}-${String(cutoff.getDate()).padStart(2,'0')}`;
  return sessions.filter(s=>s.done&&(kind==='Todas'||s.kind===kind)&&(period==='Tudo'||s.date>=minimum)&&s.title.toLocaleLowerCase('pt-BR').includes(query.trim().toLocaleLowerCase('pt-BR'))).sort((a,b)=>(b.completedAt??b.date).localeCompare(a.completedAt??a.date));
 },[sessions,kind,period,query]);
 const totalKm=entries.reduce((n,s)=>n+(s.kind==='Corrida'&&Number.isFinite(s.distanceKm)?Math.max(0,s.distanceKm??0):0),0);
 return <section aria-label="Histórico de atividades"><h2>Histórico de atividades</h2><p className="muted">Consulte apenas os treinos que você registrou como concluídos.</p>
 <div className="historyFilters"><label>Modalidade<select value={kind} onChange={e=>setKind(e.target.value)}>{['Todas','Corrida','CrossFit','Recuperação'].map(x=><option key={x}>{x}</option>)}</select></label><label>Período<select value={period} onChange={e=>setPeriod(e.target.value)}>{['Tudo','7 dias','30 dias'].map(x=><option key={x}>{x}</option>)}</select></label><label className="historySearch">Buscar treino<input type="search" placeholder="Nome do treino" value={query} onChange={e=>setQuery(e.target.value)}/></label></div>
 <p className="muted" aria-live="polite">{entries.length} atividade(s) · {totalKm.toFixed(2)} km de corrida</p>
 {entries.length?entries.map(s=><article className="activityItem" key={s.id}><div><b>{s.title}</b><p className="muted">{s.date} · {s.kind} · {duration(s)} min{s.kind==='Corrida'&&s.distanceKm&&duration(s)>0?` · ${s.distanceKm.toFixed(2)} km · ${formatPace(duration(s),s.distanceKm)}`:''}{s.rpe?` · RPE ${s.rpe}/10`:''}</p></div><CheckCircle2 size={20} aria-label="Concluído"/></article>):<p className="muted">Nenhuma atividade encontrada para os filtros selecionados.</p>}
 </section>;
}
