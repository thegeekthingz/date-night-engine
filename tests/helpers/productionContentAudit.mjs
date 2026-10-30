import { composeSession, buildSlotPools, getQueueDuration, selectReplacementForSlot, DURATION_BUDGETS } from '../../src/engine/sessionComposer.ts';
import { parseQueue, parseSession } from '../../src/engine/sessionValidation.ts';
export const slots = ['connect','predict','play','challenge','closer'];
export const seeded = seed => { let n=seed>>>0; return ()=>{ n=(Math.imul(n,1664525)+1013904223)>>>0; return n/4294967296; }; };
export function auditProduction(game,samples=100) {
 const rows=[];
 for(const vibe of game.manifest.vibes)for(const durationMinutes of [15,30])for(const intensityCeiling of ['sweet','flirty']){
  const configuration={vibe,durationMinutes,intensityCeiling}; const prepared=buildSlotPools(game,configuration); if(!prepared.ok)throw Error('invalid pools');
  const budget=DURATION_BUDGETS[durationMinutes];const totals=[],queues=new Set(),queueCounts={},frequencies={};const swapMin=slots.map(()=>Infinity),swapSum=slots.map(()=>0);let failures=0,swapFailures=0,flirtyRecipes=0;const durations={};
  for(let sample=0;sample<samples;sample++){
   const result=composeSession(game,configuration,seeded(12345+sample*7919));if(!result.ok){failures++;continue;}
   parseQueue(result.queue,game.cards);const session=parseSession({id:'audit-'+sample,gameId:game.manifest.id,gameVersion:game.manifest.version,schemaVersion:1,startedAt:'2026-01-01T00:00:00.000Z',status:'playing',configuration,queue:result.queue,currentSlot:0,displayedItemIds:[result.queue[0].itemId],swappedItemIds:[],revealState:'hidden'},game);
   const total=getQueueDuration(result.queue,game);totals.push(total);durations[total]=(durations[total]??0)+1;const key=result.queue.map(e=>e.itemId).join('|');queues.add(key);queueCounts[key]=(queueCounts[key]??0)+1;
   if(result.queue.some(e=>game.cards.find(c=>c.id===e.itemId).intensity==='flirty'))flirtyRecipes++;
   for(const e of result.queue)frequencies[e.itemId]=(frequencies[e.itemId]??0)+1;
   for(let index=0;index<5;index++){
    const old=game.cards.find(c=>c.id===result.queue[index].itemId);const excluded=new Set(result.queue.map(e=>e.itemId));
    const candidates=prepared.pools[slots[index]].filter(c=>!excluded.has(c.id)&&total-old.durationMinutes+c.durationMinutes>=budget.min&&total-old.durationMinutes+c.durationMinutes<=budget.max);
    swapMin[index]=Math.min(swapMin[index],candidates.length);swapSum[index]+=candidates.length;
    if(!selectReplacementForSlot(game,session,index,seeded(900+sample+index)).ok)swapFailures++;
   }
  }
  const sorted=Object.entries(frequencies).sort((a,b)=>b[1]-a[1]);const closers=Object.fromEntries(Object.entries(frequencies).filter(([id])=>id.startsWith('DN-CLO-')));
  rows.push({configuration,samples,failures,swapFailures,eligible:Object.fromEntries(slots.map(s=>[s,prepared.pools[s].length])),swapMin:Object.fromEntries(slots.map((s,i)=>[s,swapMin[i]])),swapMean:Object.fromEntries(slots.map((s,i)=>[s,Number((swapSum[i]/samples).toFixed(2))])),duration:{min:Math.min(...totals),max:Math.max(...totals),mean:Number((totals.reduce((a,b)=>a+b,0)/totals.length).toFixed(2)),distribution:durations},uniqueQueues:queues.size,maxQueueRepetitions:Math.max(...Object.values(queueCounts)),maxItemFrequency:sorted[0],frequencies,closerFrequency:closers,flirtyRecipes,unselectedEligible:slots.flatMap(s=>prepared.pools[s].filter(c=>!frequencies[c.id]).map(c=>c.id))});
 }
 return rows;
}
