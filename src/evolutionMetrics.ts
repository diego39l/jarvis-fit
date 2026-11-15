export type MetricSession={id:string;date:string;kind:string;minutes:number;actualMinutes?:number;distanceKm?:number;done?:boolean};
export const duration=(s:MetricSession)=>s.actualMinutes??s.minutes;
export const distance=(s:MetricSession)=>s.kind==='Corrida'&&Number.isFinite(s.distanceKm)&& (s.distanceKm??0)>0?s.distanceKm!:0;
export const pace=(minutes:number,km:number)=>{if(!Number.isFinite(minutes)||!Number.isFinite(km)||minutes<=0||km<=0)return '—';const seconds=Math.round(minutes*60/km);return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')} min/km`};
export const localDay=(d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
export function summarize(sessions:MetricSession[],now=new Date()){
 const done=sessions.filter(s=>s.done);
 const runs=done.filter(s=>s.kind==='Corrida'&&distance(s)>0&&duration(s)>0);
 const totalKm=runs.reduce((n,s)=>n+distance(s),0);
 const totalMin=done.reduce((n,s)=>n+Math.max(0,duration(s)),0);
 const runMin=runs.reduce((n,s)=>n+duration(s),0);
 const bestKm=Math.max(0,...runs.map(distance));
 const dates=new Set(done.map(s=>s.date));
 const weekly=Array.from({length:7},(_,i)=>{const d=new Date(now);d.setDate(now.getDate()-6+i);const date=localDay(d);return {date,km:runs.filter(s=>s.date===date).reduce((n,s)=>n+distance(s),0)}});
 const last7=weekly.reduce((n,s)=>n+s.km,0);
 let streak=0;const cursor=new Date(now);if(!dates.has(localDay(cursor)))cursor.setDate(cursor.getDate()-1);
 while(dates.has(localDay(cursor))){streak++;cursor.setDate(cursor.getDate()-1)}
 const best=(target:number)=>runs.filter(s=>Math.abs(distance(s)-target)<0.05).reduce<number|null>((n,s)=>n===null?duration(s):Math.min(n,duration(s)),null);
 return {done,runs,totalKm,totalMin,runMin,bestKm,weekly,last7,streak,best5:best(5),best10:best(10)};
}
