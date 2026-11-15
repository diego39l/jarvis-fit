import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
const source=await readFile(new URL('../src/evolutionMetrics.ts',import.meta.url),'utf8');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {pace,summarize}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
const session=(id,date,kind,minutes,distanceKm,extra={})=>({id,date,kind,minutes,distanceKm,done:true,...extra});
const now=new Date(2026,10,15,12);
test('pace formats exact and rounded seconds, rejects zero distance',()=>{
 assert.equal(pace(30,5),'6:00 min/km');
 assert.equal(pace(29.99,5),'6:00 min/km');
 assert.equal(pace(10,0),'—');
 assert.equal(pace(0,5),'—');
});
test('only completed runs count toward running distance and pace',()=>{
 const s=[session('a','2026-11-15','Corrida',30,5),session('b','2026-11-15','CrossFit',45,10),{...session('c','2026-11-15','Corrida',10,3),done:false}];
 const r=summarize(s,now);
 assert.equal(r.totalKm,5);assert.equal(r.runMin,30);assert.equal(r.totalMin,75);
});
test('last seven days includes today and excludes day eight',()=>{
 const r=summarize([session('a','2026-11-09','Corrida',20,3),session('b','2026-11-08','Corrida',20,4),session('c','2026-11-15','Corrida',30,5)],now);
 assert.equal(r.last7,8);assert.equal(r.weekly.length,7);
});
test('streak starts yesterday if today has no workout and handles gaps',()=>{
 const r=summarize([session('a','2026-11-14','Corrida',20,3),session('b','2026-11-13','CrossFit',30,0),session('c','2026-11-11','Corrida',20,3)],now);
 assert.equal(r.streak,2);
});
test('best times use completed near-exact distance only',()=>{
 const r=summarize([session('a','2026-11-15','Corrida',30,5),session('b','2026-11-14','Corrida',27,5),session('c','2026-11-13','Corrida',51,10),session('d','2026-11-12','Corrida',25,4.5)],now);
 assert.equal(r.best5,27);assert.equal(r.best10,51);assert.equal(r.bestKm,10);
});
test('legacy sessions without actualMinutes and distance remain valid',()=>{
 const r=summarize([{id:'old',date:'2026-11-15',kind:'Corrida',minutes:35,done:true}],now);
 assert.equal(r.totalKm,0);assert.equal(r.totalMin,35);assert.equal(r.best5,null);
});
