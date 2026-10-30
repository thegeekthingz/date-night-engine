import type { GameSession } from '../types/session.ts';
import { parseSession } from '../engine/sessionValidation.ts';

export const SESSION_STORAGE_KEY = 'social-game-engine:v1:session';
type SessionStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

// Resolve storage inside try/catch: accessing localStorage itself can throw.
// Inject a storage provider for tests or other client-side storage backends.
export function createLocalStorageAdapter(
  getStorage: () => SessionStorage = () => globalThis.localStorage,
) {
  function removeSession(): boolean {
    try {
      getStorage().removeItem(SESSION_STORAGE_KEY);
      return true;
    } catch {
      return false;
    }
  }

  function loadSession(): GameSession | null {
    let value: string | null;
    try {
      value = getStorage().getItem(SESSION_STORAGE_KEY);
    } catch {
      return null;
    }
    if (value === null) return null;
    try {
      return parseSession(JSON.parse(value));
    } catch {
      // Corrupt data is discarded if storage permits it; never clear other keys.
      removeSession();
      return null;
    }
  }

  function saveSession(session: GameSession): boolean {
    try {
      const validSession = parseSession(session);
      getStorage().setItem(SESSION_STORAGE_KEY, JSON.stringify(validSession));
      return true;
    } catch {
      return false;
    }
  }

  return { saveSession, loadSession, removeSession };
}
