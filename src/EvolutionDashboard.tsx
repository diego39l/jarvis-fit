import React from 'react';

export type DashboardSession = {id:string;date:string;kind:string;minutes:number;actualMinutes?:number;distanceKm?:number;rpe?:number;done?:boolean};
const duration=(s:DashboardSession)=>s.actualMinutes??s.minutes;
const km=(s:DashboardSession)=>s.kind==='Corrida'&&Number.isFinite(s.distanceKm)?Math.max(0,s.distanceKm??0):0;
const pace=(min:number,distance:number)=>{if(distance<=0||min<=0)return '—';const seconds=Math.round(min*60/distance);return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')} min/km`};
const localDay=(d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
export default function EvolutionDashboard({sessions}:{sessions:DashboardSession[]}){
 const done=sessions.filter(s=>s.done);
 const runs=done.filter(s=>s.kind==='Corrida'&&km(s)>0&&duration(s)>0);
 const totalKm=runs.reduce((n,s)=>n+km(s),0);
 const totalMin=done.reduce((n,s)=>n+Math.max(0,duration(s)),0);
 const runMin=runs.reduce((n,s)=>n+duration(s),0);
 const bestKm=Math.max(0,...runs.map(km));
 const dates=new Set(done.map(s=>s.date));
 const now=new Date();
 const weekly=Array.from({length:7},(_,i)=>{const d=new Date(now);d.setDate(now.getDate()-6+i);const key=localDay(d);return {date:key,km:runs.filter(s=>s.date===key).reduce((n,s)=>n+km(s),0)}});
 const maxWeekly=Math.max(1,...weekly.map(x=>x.km));
 const last7=weekly.reduce((n,s)=>n+s.km,0);
 let streak=0;const cursor=new Date(now);
 if(!dates.has(localDay(cursor)))cursor.setDate(cursor.getDate()-1);
 while(dates.has(localDay(cursor))){streak++;cursor.setDate(cursor.getDate()-1)}
 const best5=runs.filter(s=>Math.abs(km(s)-5)<0.05).reduce<number|null>((n,s)=>n===null?duration(s):Math.min(n,duration(s)),null);
 const best10=runs.filter(s=>Math.abs(km(s)-10)<0.05).reduce<number|null>((n,s)=>n===null?duration(s):Math.min(n,duration(s)),null);
 return <section aria-label="Dashboard de evolução"><h2>Dashboard Evolução</h2><p className="muted">Indicadores calculados apenas a partir de treinos concluídos. Metas iniciais: 10 km contínuos e 15 km por semana.</p>
 <div className="stats"><div><span>Distância total</span><b>{totalKm.toFixed(2)}<small> km</small></b></div><div><span>Últimos 7 dias</span><b>{last7.toFixed(2)}<small> km</small></b></div><div><span>Ritmo médio global</span><b>{pace(runMin,totalKm)}</b></div><div><span>Tempo treinado</span><b>{totalMin}<small> min</small></b></div><div><span>Sequência de dias</span><b>{streak}</b></div><div><span>Maior corrida</span><b>{bestKm.toFixed(2)}<small> km</small></b></div></div>
 <h3>Distância por dia — últimos 7 dias</h3><div role="img" aria-label="Gráfico de distância corrida nos últimos sete dias" style={{display:'flex',alignItems:'end',gap:8,height:150,marginBottom:16}}>{weekly.map(x=><div key={x.date} title={`${x.date}: ${x.km.toFixed(2)} km`} style={{flex:1,textAlign:'center',fontSize:11}}><div style={{height:Math.max(4,100*x.km/maxWeekly)+'px',background:'#a3ec61',borderRadius:5}}/><span>{x.date.slice(5)}</span></div>)}</div>
 <h3>Metas</h3><p>Maior corrida: {bestKm.toFixed(2)} / 10 km</p><div className="progress"><div style={{width:`${Math.min(100,bestKm*10)}%`}}/></div>
 <p>Distância nos últimos 7 dias: {last7.toFixed(2)} / 15 km</p><div className="progress"><div style={{width:`${Math.min(100,last7/15*100)}%`}}/></div>
 <h3>Melhores tempos registrados</h3><p>5 km: <b>{best5===null?'Ainda sem registro':`${best5.toFixed(1)} min`}</b> · 10 km: <b>{best10===null?'Ainda sem registro':`${best10.toFixed(1)} min`}</b></p>
 <p className="muted">Recordes de 5 e 10 km consideram apenas registros completos com distância próxima à meta; não estimam parciais. GPS e rotas serão entregues separadamente no aplicativo Android.</p>
 </section>
}
