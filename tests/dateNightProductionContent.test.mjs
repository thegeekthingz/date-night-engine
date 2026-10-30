import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadDefaultGame } from '../src/data/defaultGame.ts';
import { loadDefaultGame as loadFixture } from './fixtures/dateNightInfrastructure.ts';
import { parseCard, parseCards } from '../src/engine/cardValidation.ts';
import { presentItem } from '../src/components/dateNightPresentation.ts';
import { createLocalStorageAdapter, SESSION_STORAGE_KEY } from '../src/storage/localStorageAdapter.ts';
import { SESSION_SCHEMA_VERSION } from '../src/types/session.ts';
import { startDateNight } from '../src/engine/sessionStart.ts';
import { auditProduction, slots, seeded } from './helpers/productionContentAudit.mjs';
const game=loadDefaultGame();
const rows=auditProduction(game,100);
test('production inventory has 72 active, unique stable IDs and exact five-family counts',()=>{
 assert.equal(game.cards.length,72);assert.equal(new Set(game.cards.map(c=>c.id)).size,72);
 assert.equal(game.cards.filter(c=>c.active).length,72);
 for(const slot of slots){const cards=game.cards.filter(c=>slot==='closer'?c.isCloser:!c.isCloser&&c.categoryId===slot);assert.equal(cards.length,slot==='closer'?8:16);}
 assert.ok(game.cards.every(c=>/^DN-(CON|PRE|PLY|CHA|CLO)-\d{3}$/.test(c.id)));
 assert.deepEqual(parseCards(game.cards),game.cards);
});
test('production loader uses the versioned real pack, never fixture display substitutions',()=>{
 assert.equal(game.manifest.version,'2.0.0');assert.equal(game.manifest.themeId,'date-night-warm');
 for(const c of game.cards){assert.deepEqual(parseCard(c),c);assert.deepEqual(presentItem(c,c.isCloser?'closer':c.categoryId),{prompt:c.text,reveal:c.revealText,sample:false});}
 assert.ok(!JSON.stringify(game.cards).includes('fixture'));
});
test('45 Sweet and 27 Flirty items meet the 55–65 / 35–45 percent balance',()=>{
 assert.equal(game.cards.filter(c=>c.intensity==='sweet').length,45);assert.equal(game.cards.filter(c=>c.intensity==='flirty').length,27);
});
test('each item has two or three supported vibes, positive pacing, and mobile-sized copy',()=>{
 for(const c of game.cards){assert.ok(c.moods.length>=1&&c.moods.length<=3);assert.ok(c.durationMinutes>0);assert.ok(c.text.length<=240);assert.ok(!c.revealText||c.revealText.length<=200);}
});
test('all sixteen Predict items have purposeful reveal content; no fake reveal on other slots',()=>{
 assert.equal(game.cards.filter(c=>!c.isCloser&&c.categoryId==='predict'&&c.revealText?.trim()).length,16);
 assert.ok(game.cards.filter(c=>c.categoryId!=='predict'||c.isCloser).every(c=>!c.revealText));
});
for(const row of rows)test('production 100-seed coverage '+Object.values(row.configuration).join('/'),()=>{
 assert.equal(row.failures,0);assert.equal(row.swapFailures,0);
 assert.equal(row.duration.min,row.configuration.durationMinutes);assert.equal(row.duration.max,row.configuration.durationMinutes);
 assert.ok(row.uniqueQueues>=30,'editorial watch threshold: fewer than 30 distinct queues per 100 draws');
 assert.ok(row.maxQueueRepetitions<=10,'editorial watch threshold: same queue repeats over ten times');
 assert.ok(row.maxItemFrequency[1]<=75,'editorial watch threshold: one item appears in over 75% of draws');
 for(const slot of slots)assert.ok(row.swapMin[slot]>=(slot==='closer'?1:2),slot+' has useful immediate alternatives');
 if(row.configuration.intensityCeiling==='sweet')assert.equal(row.flirtyRecipes,0);else assert.ok(row.flirtyRecipes>=40,'Flirty expands actual selected experiences');
});
test('all 72 items appear somewhere in 1,600 sampled sessions, with no global unreachable item',()=>{
 for(const c of game.cards)assert.ok(rows.some(r=>r.frequencies[c.id]>0),c.id);
});
test('15 and 30 minute modes are materially different for every vibe and ceiling',()=>{
 for(const short of rows.filter(r=>r.configuration.durationMinutes===15)){
 const long=rows.find(r=>r.configuration.durationMinutes===30&&r.configuration.vibe===short.configuration.vibe&&r.configuration.intensityCeiling===short.configuration.intensityCeiling);
 assert.ok(long.duration.mean-short.duration.mean>=10);
 }
});
test('there are no exact prompt/reveal clones or heavily duplicated prompt token sets',()=>{
 assert.equal(new Set(game.cards.map(c=>c.text.toLowerCase())).size,72);
 const stop=new Set('a an the and or for to of in on at as is it your you each then with one two three together partner'.split(' '));
 const words=c=>new Set(c.text.toLowerCase().match(/[a-z]+/g).filter(w=>!stop.has(w)));
 for(let i=0;i<72;i++)for(let j=i+1;j<72;j++){const a=words(game.cards[i]),b=words(game.cards[j]);const intersection=[...a].filter(w=>b.has(w)).length;const union=new Set([...a,...b]).size;assert.ok(intersection/union<0.6,game.cards[i].id+' / '+game.cards[j].id);}
});
test('production version rejects stale preview saves without changing schema or touching Social Game storage',()=>{
 assert.equal(SESSION_SCHEMA_VERSION,1);assert.equal(SESSION_STORAGE_KEY,'date-night-engine:v1:session');
 const preview=startDateNight(loadFixture(),{vibe:'cozy',durationMinutes:15,intensityCeiling:'sweet'},{loadSession:()=>null,saveSession:()=>true},seeded(1));assert.equal(preview.ok,true);
 const map=new Map([[SESSION_STORAGE_KEY,JSON.stringify(preview.session)],['social-game-engine:v1:session','untouched']]);const touched=[];
 const adapter=createLocalStorageAdapter(game,()=>({getItem:k=>{touched.push(k);return map.get(k)??null;},setItem:(k,v)=>map.set(k,v),removeItem:k=>{touched.push(k);map.delete(k);}}));
 assert.equal(adapter.loadSession(),null);assert.equal(map.has(SESSION_STORAGE_KEY),false);assert.equal(map.get('social-game-engine:v1:session'),'untouched');assert.ok(touched.every(k=>k===SESSION_STORAGE_KEY));
});
