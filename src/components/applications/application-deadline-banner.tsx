"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Timer } from "lucide-react";

function formatRemaining(remainingMs: number) {
  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

// Only ever rendered while the deadline hasn't passed — the parent page
// swaps in the closed screen once it does (see useApplicationDeadlinePassed).
export function ApplicationDeadlineBanner({ deadlineMs }: { deadlineMs: number }) {
  const [nowMs, setNowMs] = useState<number | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNowMs(Date.now());
    const interval = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const content = (() => {
    if (nowMs === null) {
      return <span className="invisible">Applications close in 00d 00h 00m 00s</span>;
    }

    const remainingMs = Math.max(0, deadlineMs - nowMs);
    const { days, hours, minutes, seconds } = formatRemaining(remainingMs);
    const deadlineLabel = format(new Date(deadlineMs), "EEEE, MMMM d 'at' HH:mm");

    return (
      <span>
        Applications close {deadlineLabel} &mdash;{" "}
        <span className="font-mono font-semibold tabular-nums">
          {days > 0 ? `${days}d ` : ""}
          {pad(hours)}h {pad(minutes)}m {pad(seconds)}s
        </span>{" "}
        left
      </span>
    );
  })();

  return (
    <div
      role="status"
      className="fixed inset-x-0 top-24 z-[51] flex h-11 items-center justify-center gap-2 bg-primary px-4 text-center text-xs font-medium text-primary-foreground sm:text-sm"
    >
      <Timer className="size-4 shrink-0" aria-hidden="true" />
      {content}
    </div>
  );
}
