import { getMonitorCurrentStatus } from "@/lib/status/monitor-state";
import { Monitor } from "@/types/status";
import { UptimeBar } from "./UptimeBar";

export function MonitorRow({ monitor }: { monitor: Monitor }) {
  const isUp = getMonitorCurrentStatus(monitor) === 1;
  const uptimeValue =
    typeof monitor.uptime === "number" ? monitor.uptime : isUp ? 100 : undefined;
  const uptimeBadgeClass =
    uptimeValue === 100
      ? "bg-emerald-500 text-white"
      : typeof uptimeValue === "number" && uptimeValue > 50
        ? "bg-amber-500 text-white"
        : "bg-red-500 text-white";

  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 transition-colors last:border-b-0 hover:bg-slate-50 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-center gap-4 lg:w-[430px] xl:w-[500px] lg:flex-none">
        <div
          className={`min-w-[82px] rounded-lg px-3.5 py-2 text-center text-base font-semibold tracking-tight sm:text-lg ${uptimeBadgeClass}`}
        >
          {typeof uptimeValue === "number" ? `${uptimeValue}%` : "暂无"}
        </div>
        <div className="min-w-0 text-base font-medium leading-tight text-slate-900 sm:text-lg">
          {monitor.name}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="overflow-x-auto overflow-y-hidden pb-1 scrollbar-hide">
          <div className="w-full min-w-[620px]">
            <UptimeBar heartbeats={monitor.heartbeats || []} monitorName={monitor.name} />
            <div className="mt-2 flex justify-between text-xs tracking-[0.18em] text-slate-400">
              <span>1小时前</span>
              <span>现在</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
