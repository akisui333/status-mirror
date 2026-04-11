import { fetchStatusData } from "@/lib/status/fetch-source";
import { StatusHero } from "@/components/status/StatusHero";
import { MonitorGroup } from "@/components/status/MonitorGroup";
import { IncidentPanel } from "@/components/status/IncidentPanel";
import { MaintenancePanel } from "@/components/status/MaintenancePanel";
import { StatusFooter } from "@/components/status/StatusFooter";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function CodexStatusPage() {
  let statusData = null;
  let error = null;

  try {
    statusData = await fetchStatusData();
  } catch (e) {
    console.error("Failed to fetch status page data:", e);
    error = e instanceof Error ? e.message : "Unknown error occurred";
  }

  if (error || !statusData) {
    return (
      <div className="min-h-screen bg-[#0b0f15] text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#1e2329]/80 backdrop-blur-md border border-white/10 p-8 rounded-2xl text-center shadow-2xl">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Service Unavailable</h1>
          <p className="text-gray-400 mb-6">
            Unable to fetch current status data. The upstream monitoring service might be temporarily unreachable.
          </p>
          <div className="text-xs text-gray-600 bg-black/20 p-3 rounded text-left overflow-hidden text-ellipsis">
            Error: {error || "No data returned"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f15] text-gray-200 selection:bg-blue-500/30">
      {/* Background gradients similar to target site */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/5 blur-[120px]"></div>
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-32">
        <StatusHero data={statusData} />

        <MaintenancePanel maintenances={statusData.maintenanceList} />
        <IncidentPanel incidents={statusData.incident} />

        <div className="space-y-6">
          {statusData.publicGroupList.map((group) => (
            <MonitorGroup key={group.id || group.name} group={group} />
          ))}
        </div>
      </main>

      <StatusFooter />
    </div>
  );
}
