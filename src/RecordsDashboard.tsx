import React from 'react';
import {type MetricSession,distance,duration,pace} from './evolutionMetrics';
type RecordPoint={date:string;minutes:number};
function history(sessions:MetricSession[],target:number):RecordPoint[]{
 const sorted=sessions.filter(s=>s.done&&s.kind==='Corrida'&&Math.abs(distance(s)-target)<0.05&&duration(s)>0).slice().sort((a,b)=>a.date.localeCompare(b.date));
 let best=Infinity;return sorted.flatMap(s=>{if(duration(s)<best){best=duration(s);return [{date:s.date,minutes:best}]}return []});
}
const clock=(m:number)=>{const n=Math.round(m*60);return `${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`};
export default function RecordsDashboard({sessions}:{sessions:MetricSession[]}){
 const five=history(sessions,5),ten=history(sessions,10);
 const best5=five.at(-1)?.minutes,best10=ten.at(-1)?.minutes;
 const all=[...five.map(x=>x.minutes),...ten.map(x=>x.minutes)];
 const lo=Math.min(...all,0),hi=Math.max(...all,1),min=Math.max(0,Math.min(...all)-2),max=Math.max(...all)+2;
 const series=(arr:RecordPoint[])=>arr.map((p,i)=>({x:25+(i/Math.max(1,arr.length-1))*250,y:145-((p.minutes-min)/(max-min))*125}));
 const draw=(arr:RecordPoint[])=>series(arr).map(p=>p.x+','+p.y).join(' ');
 return <div className="recordsPremium"><div className="evoTitle"><h2>🏆 Recordes</h2></div>
 <section className="evoPanel"><h3>🏆 Seus melhores tempos</h3><div className="recordEntry"><span className="recordMedal">🥇</span><div><strong>5 km</strong><b>{best5===undefined?'Sem registro':clock(best5)}</b><small>Ritmo: {best5===undefined?'—':pace(best5,5)}</small></div></div><div className="recordEntry"><span className="recordMedal">🥈</span><div><strong>10 km</strong><b>{best10===undefined?'Sem registro':clock(best10)}</b><small>Ritmo: {best10===undefined?'—':pace(best10,10)}</small></div></div><p className="muted">Somente treinos completos registrados a aproximadamente 5 ou 10 km; parciais não são calculadas.</p></section>
 <section className="evoPanel"><h3>Evolução dos recordes</h3><div className="recordsLegend"><span>🔵 5 km</span><span>🟣 10 km</span></div>{all.length? <svg className="recordsChart" viewBox="0 0 300 185" role="img" aria-label="Evolução dos melhores tempos registrados em 5 e 10 quilômetros"><g stroke="#28425d" strokeWidth="1">{[20,55,90,125,160].map(y=><line key={y} x1="25" x2="285" y1={y} y2={y}/>)}</g>{five.length>1&&<polyline points={draw(five)} fill="none" stroke="#168cff" strokeWidth="3"/>}{ten.length>1&&<polyline points={draw(ten)} fill="none" stroke="#a15aff" strokeWidth="3"/>}{series(five).map((p,i)=><circle key={'f'+i} cx={p.x} cy={p.y} r="4" fill="#168cff"/>)}{series(ten).map((p,i)=><circle key={'t'+i} cx={p.x} cy={p.y} r="4" fill="#a15aff"/>)}</svg>:<p className="muted">Registre uma corrida completa de 5 km ou 10 km para começar seu histórico.</p>}<p className="muted">{all.length<2?'O gráfico terá uma linha de evolução após novos recordes.':'Cada ponto representa uma melhora real do recorde, em ordem cronológica.'}</p></section>
 </div>
}
