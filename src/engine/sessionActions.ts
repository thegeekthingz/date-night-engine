import type { GameSession } from '../types/session.ts';
import type { Random } from './sessionComposer.ts';
import { selectReplacementForSlot } from './sessionComposer.ts';
import { parseSession } from './sessionValidation.ts';
import type { SessionContext } from './sessionValidation.ts';

export type SessionAction = { type: 'done' | 'reveal' | 'swap' } |
  { type: 'end'; confirmed: boolean };
export type ActionFailure = 'invalid_state' | 'reveal_unavailable' | 'no_replacement' | 'confirmation_required';
export type ActionResult = { ok: true; session: GameSession; changed: boolean } |
  { ok: false; reason: ActionFailure };
export type ActionInputs = { at: string; random: Random };

export function hasReveal(context: SessionContext, session: GameSession): boolean {
  const currentId = session.queue[session.currentSlot]?.itemId;
  return Boolean(context.cards.find(card => card.id === currentId)?.revealText?.trim());
}

export function getProgress(session: GameSession) {
  return { ordinal: session.currentSlot + 1,
    completed: session.status === 'ended' && session.endedReason === 'completed' ? 5 : session.currentSlot,
    total: 5 as const };
}

// No storage, clock reads or mutation here. Time and Swap randomness are caller inputs.
export function applySessionAction(context: SessionContext, value: GameSession,
  action: SessionAction, inputs: ActionInputs): ActionResult {
  let session: GameSession;
  try { session = parseSession(value, context); } catch { return { ok: false, reason: 'invalid_state' }; }
  if (session.status !== 'playing') return { ok: false, reason: 'invalid_state' };
  if (!action || typeof action !== 'object') return { ok: false, reason: 'invalid_state' };
  let candidate = session;
  switch (action.type) {
    case 'done': {
      if (session.currentSlot === 4) {
        candidate = { ...session, status: 'ended', endedReason: 'completed', endedAt: inputs.at, revealState: 'hidden' };
      } else {
        const currentSlot = session.currentSlot + 1;
        const nextId = session.queue[currentSlot]!.itemId;
        candidate = { ...session, currentSlot, revealState: 'hidden',
          displayedItemIds: [...new Set([...session.displayedItemIds, nextId])] };
      }
      break;
    }
    case 'reveal':
      if (!hasReveal(context, session)) return { ok: false, reason: 'reveal_unavailable' };
      if (session.revealState === 'revealed') return { ok: true, session, changed: false };
      candidate = { ...session, revealState: 'revealed' };
      break;
    case 'swap': {
      const replacement = selectReplacementForSlot(context, session, session.currentSlot, inputs.random);
      if (!replacement.ok) return replacement;
      candidate = { ...session, queue: replacement.queue, revealState: 'hidden',
        swappedItemIds: [...session.swappedItemIds, replacement.retiredItemId],
        displayedItemIds: [...session.displayedItemIds, replacement.replacementItemId] };
      break;
    }
    case 'end':
      if (action.confirmed !== true) return { ok: false, reason: 'confirmation_required' };
      candidate = { ...session, status: 'ended', endedReason: 'cancelled', endedAt: inputs.at };
      break;
    default:
      return { ok: false, reason: 'invalid_state' };
  }
  try { return { ok: true, session: parseSession(candidate, context), changed: true }; }
  catch { return { ok: false, reason: 'invalid_state' }; }
}
