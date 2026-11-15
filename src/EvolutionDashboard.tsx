import React from 'react';
import {pace,summarize,type MetricSession} from './evolutionMetrics';

const formatTime=(m:number)=>{const total=Math.round(m*60);return `${Math.floor(total/3600)}:${String(Math.floor(total%3600/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`};
export default function EvolutionDashboard({sessions}:{sessions:MetricSession[]}){
 const {done,totalKm,totalMin,runMin,bestKm,weekly,last7,streak,best5,best10,runs}=summarize(sessions);
 const maxWeekly=Math.max(1,...weekly.map(x=>x.km));
 const stats=[
  {label:'Distância total',value:totalKm.toFixed(2)+' km',icon:'📍'},
  {label:'Tempo de treino',value:formatTime(totalMin),icon:'◷'},
  {label:'Treinos',value:String(done.length),icon:'▦'},
  {label:'Sequência',value:streak+' dias',icon:'🔥'}
 ];
 return <div className="evoPremium" aria-label="Dashboard de evolução">
  <div className="evoTitle"><div><span className="evoKicker">✦ SEU DESEMPENHO</span><h2>Evolução</h2></div><span className="tag">{runs.length} corridas</span></div>
  <div className="evoTabs"><span className="selected">Geral</span><span>Corrida</span><span>CrossFit</span></div>
  <div className="evoStatGrid">{stats.map(s=><article key={s.label} className="evoStat"><span>{s.icon} {s.label}</span><strong>{s.value}</strong></article>)}</div>
  <section className="evoPanel"><div className="evoPanelHead"><h3>Distância por dia</h3><small>Últimos 7 dias</small></div><div className="evoChart" role="img" aria-label="Distância diária percorrida nos últimos sete dias">
   {weekly.map(x=><div className="evoBarCol" key={x.date} title={`${x.date}: ${x.km.toFixed(2)} km`}><span>{x.km?x.km.toFixed(1):'0'}</span><div className="evoBarTrack"><div className="evoBar" style={{height:`${x.km?Math.max(5,100*x.km/maxWeekly):0}%`}}/></div><small>{x.date.slice(5)}</small></div>)}
  </div><p className="muted">Distâncias registradas em treinos concluídos; dias sem registro aparecem zerados.</p></section>
  <section className="evoPanel"><h3>Metas</h3><div className="evoGoal"><div><span>Maior corrida contínua</span><b>{bestKm.toFixed(2)} / 10 km</b></div><div className="evoProgress" role="progressbar" aria-label="Meta de corrida contínua" aria-valuenow={Math.min(100,Math.round(bestKm/10*100))} aria-valuemin={0} aria-valuemax={100}><span style={{width:`${Math.min(100,bestKm/10*100)}%`}}/></div></div><div className="evoGoal"><div><span>Distância nos últimos 7 dias</span><b>{last7.toFixed(2)} / 15 km</b></div><div className="evoProgress blue" role="progressbar" aria-label="Meta semanal" aria-valuenow={Math.min(100,Math.round(last7/15*100))} aria-valuemin={0} aria-valuemax={100}><span style={{width:`${Math.min(100,last7/15*100)}%`}}/></div></div><p className="muted">Metas iniciais de referência, ainda não personalizáveis.</p></section>
  <section className="evoPanel"><h3>Recordes pessoais 🏆</h3><div className="evoRecords"><div><span>5 km</span><strong>{best5===null?'Sem registro':formatTime(best5)}</strong></div><div><span>10 km</span><strong>{best10===null?'Sem registro':formatTime(best10)}</strong></div></div><p className="muted">Somente corridas completas registradas próximas de 5 km ou 10 km. Não calculamos parciais.</p></section>
  <section className="evoPanel"><h3>Ritmo médio</h3><strong className="evoPace">{pace(runMin,totalKm)}</strong><p className="muted">Calculado a partir das corridas registradas. GPS em tempo real fica para uma etapa futura.</p></section>
 </div>;
}
