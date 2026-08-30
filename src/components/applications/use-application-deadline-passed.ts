"use client";

import { useEffect, useState } from "react";

/**
 * Whether `deadlineMs` has passed, flipping live if the visitor is already
 * on the page when it does — not just on next page load. `deadlineMs` is
 * undefined while the deadline is still loading, in which case this always
 * returns false (the caller is expected to show a loading state instead of
 * trusting this value until loading finishes).
 */
export function useApplicationDeadlinePassed(deadlineMs: number | undefined) {
  const [passed, setPassed] = useState(
    () => deadlineMs !== undefined && Date.now() >= deadlineMs,
  );

  useEffect(() => {
    if (deadlineMs === undefined || passed) return;

    const msRemaining = deadlineMs - Date.now();
    if (msRemaining <= 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPassed(true);
      return;
    }

    const timeout = setTimeout(() => setPassed(true), msRemaining);
    return () => clearTimeout(timeout);
  }, [deadlineMs, passed]);

  return passed;
}
