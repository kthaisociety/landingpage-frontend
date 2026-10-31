import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

/** True after client hydration; false during SSR and the first client render. */
export function useHydrated() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
