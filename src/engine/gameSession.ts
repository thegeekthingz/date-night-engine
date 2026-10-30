import { parseSession } from './sessionValidation.ts';
import type { SessionContext } from './sessionValidation.ts';
export function isSessionCompatible(value: unknown, context: SessionContext): boolean {
  try { parseSession(value, context); return true; } catch { return false; }
}
