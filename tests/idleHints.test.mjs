import { test } from 'node:test';
import assert from 'node:assert/strict';
import { connectIdleHints, createIdleHints } from '../src/components/idleHints.ts';

function clock() {
  let now = 0, id = 0;
  const jobs = new Map();
  return {
    schedule: (fn, delay) => { jobs.set(++id, { fn, at: now + delay }); return id; },
    cancel: key => jobs.delete(key),
    tick: ms => { now += ms; for (const [key, job] of jobs) if (job.at <= now) { jobs.delete(key); job.fn(); } },
    count: () => jobs.size,
  };
}
test('new card idle cycle hints exactly at 5.5s and 15.5s, then stops', () => {
  const c = clock(), seen = [];
  createIdleHints(hint => seen.push(hint), c.schedule, c.cancel);
  c.tick(5499); assert.deepEqual(seen, [0]);
  c.tick(1); assert.deepEqual(seen, [0, 1]);
  c.tick(9999); assert.deepEqual(seen, [0, 1]);
  c.tick(1); assert.deepEqual(seen, [0, 1, 2]);
  c.tick(60000); assert.deepEqual(seen, [0, 1, 2]);
  assert.equal(c.count(), 0);
});
test('interaction resets pending timers without duplicate registrations', () => {
  const c = clock(), seen = [];
  const cycle = createIdleHints(hint => seen.push(hint), c.schedule, c.cancel);
  c.tick(5000); cycle.reset(); cycle.reset(); assert.equal(c.count(), 2);
  c.tick(500); assert.ok(!seen.includes(1));
  c.tick(5000); assert.equal(seen.at(-1), 1);
  cycle.dispose(); c.tick(20000); assert.equal(seen.at(-1), 1);
  assert.equal(c.count(), 0);
});
test('card/session change disposes old cycle; unmount leaves no pending work', () => {
  const c = clock(), old = [], fresh = [];
  const first = createIdleHints(h => old.push(h), c.schedule, c.cancel);
  c.tick(5400); first.dispose();
  const second = createIdleHints(h => fresh.push(h), c.schedule, c.cancel);
  c.tick(100); assert.deepEqual(old, [0]); assert.deepEqual(fresh, [0]);
  c.tick(5400); assert.deepEqual(fresh, [0, 1]);
  second.dispose(); second.reset(); c.tick(50000);
  assert.deepEqual(fresh, [0, 1]); assert.equal(c.count(), 0);
});

test('reduced motion and hidden page stop timers; interaction listeners reset and clean up', () => {
  const win = new EventTarget(), doc = new EventTarget(), motion = new EventTarget();
  motion.matches = true; doc.hidden = false; win.matchMedia = () => motion;
  let starts = 0, resets = 0, disposals = 0;
  const factory = () => { starts++; return { reset: () => resets++, dispose: () => disposals++ }; };
  const cleanup = connectIdleHints(() => {}, true, win, doc, factory);
  assert.equal(starts, 0);
  motion.matches = false; motion.dispatchEvent(new Event('change'));
  assert.equal(starts, 1);
  for (const event of ['pointerdown', 'keydown', 'wheel', 'focusin', 'input', 'click']) win.dispatchEvent(new Event(event));
  assert.equal(resets, 6);
  motion.matches = true; motion.dispatchEvent(new Event('change'));
  assert.equal(disposals, 1);
  doc.hidden = true; motion.matches = false; doc.dispatchEvent(new Event('visibilitychange'));
  assert.equal(starts, 1);
  cleanup(); win.dispatchEvent(new Event('click')); doc.hidden = false; doc.dispatchEvent(new Event('visibilitychange'));
  assert.equal(resets, 6); assert.equal(starts, 1);
  connectIdleHints(() => {}, false, win, doc, factory)(); assert.equal(starts, 1);
});
