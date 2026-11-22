import { useSyncExternalStore } from 'react';
import { store, subscribe } from '@/services/store';

// Re-render subscribers whenever the operational store mutates
// (new allocations, status changes, acknowledged alerts...).

export function useStore() {
  useSyncExternalStore(subscribe, () => storeVersion);
  return store;
}

// A monotonically bumped snapshot reference — store getters read live arrays,
// so the version counter is enough to trigger re-render.
let storeVersion = 0;
subscribe(() => { storeVersion += 1; });
