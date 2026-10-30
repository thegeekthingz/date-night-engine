import { useEffect, useState } from 'react';
import { connectIdleHints } from './idleHints';

export function useIdleHints(cardKey: string, enabled: boolean) {
  const [state, setState] = useState<{ key: string; hint: 0 | 1 | 2 }>({ key: '', hint: 0 });
  useEffect(() => {
    return connectIdleHints(hint => setState({ key: cardKey, hint }), enabled);
  }, [cardKey, enabled]);
  return state.key === cardKey ? state.hint : 0;
}
