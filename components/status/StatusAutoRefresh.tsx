"use client";

import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";

interface StatusAutoRefreshProps {
  intervalMs?: number;
}

export function StatusAutoRefresh({
  intervalMs = 30_000,
}: StatusAutoRefreshProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const timerId = window.setInterval(() => {
      if (isPending) {
        return;
      }

      startTransition(() => {
        router.refresh();
      });
    }, intervalMs);

    return () => {
      window.clearInterval(timerId);
    };
  }, [intervalMs, isPending, router, startTransition]);

  return null;
}
