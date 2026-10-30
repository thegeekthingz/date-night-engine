import assert from 'node:assert/strict';
import { test, before, after } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import { VIBE_TOKENS, vibeStyle } from '../src/theme/vibeTokens.ts';
import { loadDefaultGame } from '../src/data/defaultGame.ts';
import { startDateNight } from '../src/engine/sessionStart.ts';
import { SESSION_STORAGE_KEY } from '../src/storage/localStorageAdapter.ts';
const vibes = ['cozy','funny','romantic','competitive'];
const luminance = hex => {
  const c = hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=0.04045?x/12.92:((x+0.055)/1.055)**2.4);
  return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2];
};
const contrast = (a,b) => { const x=luminance(a), y=luminance(b); return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05); };
let server, App, Setup;
const savedDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const values = new Map(); const keys = [];
before(async()=>{
  Object.defineProperty(globalThis,'localStorage',{ configurable:true,value:{
    getItem(key){ keys.push(key); return values.get(key) ?? null; },
    setItem(key,value){ throw new Error('render must not write'); },
    removeItem(key){ throw new Error('valid restore must not remove'); },
  }});
  server=await createServer({server:{middlewareMode:true,hmr:false,ws:false},appType:'custom'});
  App=(await server.ssrLoadModule('/src/App.tsx')).default;
  Setup=(await server.ssrLoadModule('/src/components/DateNightSetup.tsx')).default;
});
after(async()=>{await server?.close();if(savedDescriptor)Object.defineProperty(globalThis,'localStorage',savedDescriptor);else delete globalThis.localStorage;});
test('one centralized mapping provides four distinct accent layers',()=>{
  assert.deepEqual(Object.keys(VIBE_TOKENS),vibes);
  assert.equal(new Set(vibes.map(v=>VIBE_TOKENS[v].accent)).size,4);
  for(const vibe of vibes){const style=vibeStyle(vibe);assert.equal(style['--vibe-accent'],VIBE_TOKENS[vibe].accent);
    assert.equal(Object.keys(style).length,10);assert.ok(!('--background' in style));assert.ok(!('--primary' in style));}
});
for(const vibe of vibes)test(vibe+' accent text, progress, borders, reveal and focus retain contrast',()=>{
  const t=VIBE_TOKENS[vibe];
  assert.ok(contrast(t.accent,'#222620')>=4.5);
  assert.ok(contrast(t.progress,'#3B4235')>=3);
  assert.ok(contrast(t.border,'#222620')>=3);
  assert.ok(contrast('#F5F1E8',t.soft)>=4.5);
  assert.ok(contrast('#F5F1E8',t.tint)>=4.5);
  assert.ok(contrast('#F5F1E8',t.reveal)>=4.5);
  assert.ok(contrast(t.highlight,'#3B4235')>=3);
  assert.ok(contrast(t.accent,t.soft)>=4.5);
  assert.ok(contrast('#1A2117','#C6D4AE')>=4.5);
  assert.ok(contrast('#E1D0B4',t.soft)>=3);
});
test('Home remains neutral without a persisted session',()=>{
  values.clear();const html=renderToStaticMarkup(createElement(App));
  assert.ok(html.includes('BUILD YOUR DATE'));assert.ok(!html.includes('data-vibe='));assert.ok(!html.includes('--vibe-accent:'));
});
for(const vibe of vibes)test('valid '+vibe+' restore derives presentation directly from existing configuration',()=>{
  const game=loadDefaultGame();const start=startDateNight(game,{vibe,durationMinutes:15,intensityCeiling:'sweet'},
    {loadSession:()=>null,saveSession:()=>true},()=>0.9);
  assert.equal(start.ok,true);values.clear();keys.length=0;const raw=JSON.stringify(start.session);values.set(SESSION_STORAGE_KEY,raw);
  const html=renderToStaticMarkup(createElement(App));
  assert.ok(html.includes('data-vibe="'+vibe+'"'));assert.ok(html.includes('--vibe-accent:'+VIBE_TOKENS[vibe].accent));
  assert.equal(values.get(SESSION_STORAGE_KEY),raw);assert.ok(keys.every(k=>k===SESSION_STORAGE_KEY));
});
test('Setup gives every option its own preview tokens while retaining native radios',()=>{
  const html=renderToStaticMarkup(createElement(Setup,{value:{vibe:'romantic',durationMinutes:15,intensityCeiling:'sweet'},
    onChange(){},onStart(){},onHome(){},headingRef:{current:null}}));
  for(const vibe of vibes){assert.ok(html.includes('data-option-vibe="'+vibe+'"'));assert.ok(html.includes('--vibe-accent:'+VIBE_TOKENS[vibe].accent));}
  assert.equal((html.match(/type="radio"/g)??[]).length,8);
});
for(const reason of ['completed','cancelled'])test('ended '+reason+' exposes its reason for distinct restrained styling',()=>{
  const game=loadDefaultGame();const r=startDateNight(game,{vibe:'romantic',durationMinutes:15,intensityCeiling:'sweet'},
    {loadSession:()=>null,saveSession:()=>true},()=>0.9);assert.equal(r.ok,true);
  const s={...r.session,status:'ended',endedReason:reason,endedAt:'2099-01-01T00:00:00.000Z'};
  if(reason==='completed'){s.currentSlot=4;s.displayedItemIds=s.queue.map(x=>x.itemId);}
  values.clear();values.set(SESSION_STORAGE_KEY,JSON.stringify(s));
  const html=renderToStaticMarkup(createElement(App));assert.ok(html.includes('data-vibe="romantic"'));
  assert.ok(html.includes('data-ended-reason="'+reason+'"'));
  assert.ok(html.includes(reason==='completed'?'Your date is complete':'You stopped this date early.'));
});
