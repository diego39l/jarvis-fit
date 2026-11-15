import React from 'react';

import {pace,summarize,type MetricSession} from './evolutionMetrics';
export default function EvolutionDashboard({sessions}:{sessions:MetricSession[]}){
 const {totalKm,totalMin,runMin,bestKm,weekly,last7,streak,best5,best10}=summarize(sessions);
 const maxWeekly=Math.max(1,...weekly.map(x=>x.km));
 return <section aria-label="Dashboard de evolução"><h2>Dashboard Evolução</h2><p className="muted">Indicadores calculados apenas a partir de treinos concluídos. Metas iniciais: 10 km contínuos e 15 km por semana.</p>
 <div className="stats"><div><span>Distância total</span><b>{totalKm.toFixed(2)}<small> km</small></b></div><div><span>Últimos 7 dias</span><b>{last7.toFixed(2)}<small> km</small></b></div><div><span>Ritmo médio global</span><b>{pace(runMin,totalKm)}</b></div><div><span>Tempo treinado</span><b>{totalMin}<small> min</small></b></div><div><span>Sequência de dias</span><b>{streak}</b></div><div><span>Maior corrida</span><b>{bestKm.toFixed(2)}<small> km</small></b></div></div>
 <h3>Distância por dia — últimos 7 dias</h3><div role="img" aria-label="Gráfico de distância corrida nos últimos sete dias" style={{display:'flex',alignItems:'end',gap:8,height:150,marginBottom:16}}>{weekly.map(x=><div key={x.date} title={`${x.date}: ${x.km.toFixed(2)} km`} style={{flex:1,textAlign:'center',fontSize:11}}><div style={{height:Math.max(4,100*x.km/maxWeekly)+'px',background:'#a3ec61',borderRadius:5}}/><span>{x.date.slice(5)}</span></div>)}</div>
 <h3>Metas</h3><p>Maior corrida: {bestKm.toFixed(2)} / 10 km</p><div className="progress"><div style={{width:`${Math.min(100,bestKm*10)}%`}}/></div>
 <p>Distância nos últimos 7 dias: {last7.toFixed(2)} / 15 km</p><div className="progress"><div style={{width:`${Math.min(100,last7/15*100)}%`}}/></div>
 <h3>Melhores tempos registrados</h3><p>5 km: <b>{best5===null?'Ainda sem registro':`${best5.toFixed(1)} min`}</b> · 10 km: <b>{best10===null?'Ainda sem registro':`${best10.toFixed(1)} min`}</b></p>
 <p className="muted">Recordes de 5 e 10 km consideram apenas registros completos com distância próxima à meta; não estimam parciais. GPS e rotas serão entregues separadamente no aplicativo Android.</p>
 </section>
}
