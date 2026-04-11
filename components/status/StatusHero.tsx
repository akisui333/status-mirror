import { StatusData } from "@/types/status";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

export function StatusHero({ data }: { data: StatusData }) {
  const { title } = data.config;

  let overallStatus = "up";
  let statusText = "全部服务运行正常";

  const allMonitors = data.publicGroupList.flatMap((g) => g.monitorList || []);

  if (allMonitors.some((m) => m.status === 0)) {
    overallStatus = "down";
    statusText = "部分服务不可用";
  } else if (allMonitors.some((m) => m.status === 2 || m.status === 3)) {
    overallStatus = "degraded";
    statusText = "性能下降或维护中";
  } else if (data.incident && data.incident.length > 0) {
    overallStatus = "degraded";
    statusText = "当前存在事件";
  }

  return (
    <div className="mb-8 flex flex-col gap-5 border-b border-slate-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-4xl">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-[2.75rem]">
          {title}
        </h1>
        {data.config.description && (
          <p className="mt-3 text-base leading-7 text-slate-600 sm:text-lg">
            {data.config.description}
          </p>
        )}
      </div>

      <div
        className={`inline-flex items-center gap-3 rounded-xl border px-5 py-3 text-base font-medium ${
          overallStatus === "up"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : overallStatus === "down"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-amber-200 bg-amber-50 text-amber-700"
        }`}
      >
        {overallStatus === "up" && <CheckCircle2 className="h-6 w-6" />}
        {overallStatus === "down" && <XCircle className="h-6 w-6" />}
        {overallStatus === "degraded" && <AlertTriangle className="h-6 w-6" />}
        <span>{statusText}</span>
      </div>
    </div>
  );
}
