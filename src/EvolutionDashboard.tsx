import React from 'react';
import {pace,summarize,type MetricSession} from './evolutionMetrics';

export default function EvolutionDashboard({sessions}:{sessions:MetricSession[]}){
 const {totalKm,totalMin,runMin,bestKm,weekly,last7,streak,best5,best10,runs}=summarize(sessions);
 const maxWeekly=Math.max(1,...weekly.map(x=>x.km));
 const stats=[
  {label:'Distância acumulada',value:totalKm.toFixed(2),unit:'km',accent:'#60a5fa'},
  {label:'Últimos 7 dias',value:last7.toFixed(2),unit:'km',accent:'#a3e635'},
  {label:'Ritmo médio',value:pace(runMin,totalKm),unit:'',accent:'#c4b5fd'},
  {label:'Tempo de treino',value:String(totalMin),unit:'min',accent:'#fbbf24'},
  {label:'Sequência atual',value:String(streak),unit:'dias',accent:'#fb7185'},
  {label:'Maior corrida',value:bestKm.toFixed(2),unit:'km',accent:'#2dd4bf'}
 ];
 return <section aria-label="Dashboard de evolução">
  <div style={{display:'flex',justifyContent:'space-between',alignItems:'start',gap:12,flexWrap:'wrap'}}>
   <div><p className="muted" style={{marginBottom:4}}>SEU DESEMPENHO</p><h2 style={{marginTop:0}}>Evolução das corridas</h2></div>
   <span className="tag">{runs.length} corridas registradas</span>
  </div>
  <p className="muted">Dados dos treinos concluídos. O GPS Android será integrado em uma etapa posterior.</p>
  <div className="stats">{stats.map(s=><div key={s.label} style={{borderTop:`3px solid ${s.accent}`}}><span>{s.label}</span><b>{s.value}{s.unit&&<small> {s.unit}</small>}</b></div>)}</div>
  <h3>Distância diária · últimos 7 dias</h3>
  <div role="img" aria-label="Gráfico de distância em quilômetros nos últimos sete dias" style={{display:'flex',alignItems:'end',gap:8,height:174,marginBottom:18,padding:'12px 0'}}>
   {weekly.map(x=><div key={x.date} title={`${x.date}: ${x.km.toFixed(2)} km`} style={{flex:1,minWidth:0,textAlign:'center',fontSize:11,display:'flex',flexDirection:'column',justifyContent:'end',height:'100%'}}>
    <span style={{marginBottom:5}}>{x.km>0?x.km.toFixed(1):'—'}</span>
    <div style={{height:`${Math.max(4,100*x.km/maxWeekly)}px`,background:'#a3ec61',borderRadius:'6px 6px 2px 2px'}}/>
    <span style={{marginTop:6}}>{x.date.slice(5)}</span>
   </div>)}
  </div>
  <h3>Metas atuais</h3>
  <div style={{display:'flex',justifyContent:'space-between',gap:12}}><span>Maior corrida contínua</span><b>{bestKm.toFixed(2)} / 10 km</b></div>
  <div className="progress" role="progressbar" aria-label="Meta de corrida contínua" aria-valuenow={Math.min(100,Math.round(bestKm/10*100))} aria-valuemin={0} aria-valuemax={100}><div style={{width:`${Math.min(100,bestKm/10*100)}%`}}/></div>
  <div style={{display:'flex',justifyContent:'space-between',gap:12,marginTop:14}}><span>Volume dos últimos 7 dias</span><b>{last7.toFixed(2)} / 15 km</b></div>
  <div className="progress" role="progressbar" aria-label="Meta de distância nos últimos sete dias" aria-valuenow={Math.min(100,Math.round(last7/15*100))} aria-valuemin={0} aria-valuemax={100}><div style={{width:`${Math.min(100,last7/15*100)}%`}}/></div>
  <p className="muted">As metas de 10 km e 15 km ainda são valores iniciais; personalização será uma entrega separada.</p>
  <h3>Recordes pessoais</h3>
  <div className="stats"><div><span>Melhor 5 km</span><b>{best5===null?'—':`${best5.toFixed(1)} min`}</b></div><div><span>Melhor 10 km</span><b>{best10===null?'—':`${best10.toFixed(1)} min`}</b></div></div>
  <p className="muted">Recordes consideram apenas corridas completas próximas de 5 ou 10 km; não calculam parciais.</p>
 </section>;
}
