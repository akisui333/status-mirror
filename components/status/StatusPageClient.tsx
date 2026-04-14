"use client";

import { IncidentPanel } from "@/components/status/IncidentPanel";
import { MaintenancePanel } from "@/components/status/MaintenancePanel";
import { MonitorGroup } from "@/components/status/MonitorGroup";
import { StatusHero } from "@/components/status/StatusHero";
import { StatusData } from "@/types/status";
import { startTransition, useEffect, useEffectEvent, useRef, useState } from "react";

interface StatusPageClientProps {
  intervalMs?: number;
}

interface StatusApiError {
  error?: string;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "发生未知错误";
}

function getResponsePreview(text: string): string {
  return text.replace(/\s+/g, " ").trim().slice(0, 180);
}

export function StatusPageClient({ intervalMs = 30_000 }: StatusPageClientProps) {
  const [statusData, setStatusData] = useState<StatusData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isFetchingRef = useRef(false);
  const intervalIdRef = useRef<number | null>(null);

  const clearPolling = useEffectEvent(() => {
    if (intervalIdRef.current !== null) {
      window.clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
  });

  const fetchStatus = useEffectEvent(async () => {
    if (document.visibilityState !== "visible" || isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;

    try {
      const response = await fetch(`/api/status/codex?_=${Date.now()}`, {
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });
      const contentType = response.headers.get("content-type") || "";
      const rawText = await response.text();

      if (!contentType.toLowerCase().includes("application/json")) {
        throw new Error(
          `本地 API /api/status/codex 返回了 ${response.status} ${response.statusText}，内容不是 JSON。很可能是反向代理、Cloudflare 或 Nginx 返回了 HTML 页面。响应片段：${getResponsePreview(rawText)}`
        );
      }

      let payload: StatusData | StatusApiError;

      try {
        payload = JSON.parse(rawText) as StatusData | StatusApiError;
      } catch {
        throw new Error(
          `本地 API /api/status/codex 返回的 JSON 无法解析，响应片段：${getResponsePreview(rawText)}`
        );
      }

      if (!response.ok) {
        throw new Error(
          "error" in payload && payload.error
            ? payload.error
            : `Status request failed: ${response.status} ${response.statusText}`
        );
      }

      startTransition(() => {
        setStatusData(payload as StatusData);
        setError(null);
      });
    } catch (fetchError) {
      startTransition(() => {
        setError(getErrorMessage(fetchError));
      });
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  });

  const syncPollingState = useEffectEvent(() => {
    clearPolling();

    if (document.visibilityState !== "visible") {
      return;
    }

    intervalIdRef.current = window.setInterval(() => {
      void fetchStatus();
    }, intervalMs);
  });

  useEffect(() => {
    void fetchStatus();
    syncPollingState();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void fetchStatus();
      }

      syncPollingState();
    };

    const handleFocus = () => {
      if (document.visibilityState === "visible") {
        void fetchStatus();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      clearPolling();
    };
  }, [intervalMs]);

  if (!statusData) {
    if (isLoading) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-slate-900">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <h1 className="mb-5 text-3xl font-semibold text-slate-900">正在获取状态数据</h1>
            <p className="text-base leading-7 text-slate-600">
              页面可见时才会向上游发起抓取请求。
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-slate-900">
        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <h1 className="mb-5 text-3xl font-semibold text-red-600">服务暂不可用</h1>
          <p className="mb-7 text-base leading-7 text-slate-600">
            无法获取当前状态数据，源监控服务可能暂时无法访问。
          </p>
          <div className="overflow-hidden rounded-xl bg-slate-50 p-4 text-left text-sm text-slate-500">
            错误：{error || "未返回数据"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-sky-200/70">
      <main className="mx-auto w-full max-w-[1680px] bg-transparent px-5 pb-20 pt-12 sm:px-8 lg:px-10">
        <StatusHero data={statusData} />

        {error && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
            最近一次刷新失败：{error}
          </div>
        )}

        <MaintenancePanel maintenances={statusData.maintenanceList} />
        <IncidentPanel incidents={statusData.incident} />

        <div className="space-y-5">
          {statusData.publicGroupList.map((group) => (
            <MonitorGroup key={group.id || group.name} group={group} />
          ))}
        </div>
      </main>
    </div>
  );
}
