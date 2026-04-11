import { IncidentPanel } from "@/components/status/IncidentPanel";
import { StatusAutoRefresh } from "@/components/status/StatusAutoRefresh";
import { MaintenancePanel } from "@/components/status/MaintenancePanel";
import { MonitorGroup } from "@/components/status/MonitorGroup";
import { StatusHero } from "@/components/status/StatusHero";
import { fetchStatusData } from "@/lib/status/fetch-source";

export const dynamic = "force-dynamic";

export default async function CodexStatusPage() {
  let statusData = null;
  let error = null;

  try {
    statusData = await fetchStatusData();
  } catch (e) {
    console.error("Failed to fetch status page data:", e);
    error = e instanceof Error ? e.message : "发生未知错误";
  }

  if (error || !statusData) {
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
      <StatusAutoRefresh intervalMs={30_000} />
      <main className="mx-auto w-full max-w-[1680px] bg-transparent px-5 pb-20 pt-12 sm:px-8 lg:px-10">
        <StatusHero data={statusData} />

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
