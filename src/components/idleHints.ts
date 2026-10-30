// UI-only clock: two one-shot hints per idle cycle, never a gameplay timer.
export const IDLE_HINT_DELAYS = [5500, 15500] as const;

export function createIdleHints(onHint: (hint: 0 | 1 | 2) => void,
  schedule: typeof setTimeout = setTimeout, cancel: typeof clearTimeout = clearTimeout) {
  let handles: ReturnType<typeof setTimeout>[] = [];
  let generation = 0;
  let disposed = false;
  const clear = () => { generation++; handles.forEach(cancel); handles = []; };
  const reset = () => {
    if (disposed) return;
    clear();
    onHint(0);
    const current = generation;
    handles = IDLE_HINT_DELAYS.map((delay, index) => schedule(() => {
      if (!disposed && current === generation) onHint(index === 0 ? 1 : 2);
    }, delay));
  };
  reset();
  return { reset, dispose: () => { disposed = true; clear(); } };
}

export function connectIdleHints(onHint: (hint: 0 | 1 | 2) => void, enabled: boolean,
  win: Window = window, doc: Document = document, create = createIdleHints) {
  const motion = win.matchMedia('(prefers-reduced-motion: reduce)');
  let cycle: ReturnType<typeof createIdleHints> | undefined;
  const configure = () => {
    cycle?.dispose();
    cycle = undefined;
    onHint(0);
    if (enabled && !motion.matches && !doc.hidden) cycle = create(onHint);
  };
  const interact = () => cycle?.reset();
  const events = ['pointerdown', 'keydown', 'wheel', 'focusin', 'input', 'click'] as const;
  configure();
  events.forEach(event => win.addEventListener(event, interact, { passive: true }));
  motion.addEventListener('change', configure);
  doc.addEventListener('visibilitychange', configure);
  return () => {
    cycle?.dispose();
    events.forEach(event => win.removeEventListener(event, interact));
    motion.removeEventListener('change', configure);
    doc.removeEventListener('visibilitychange', configure);
  };
}
