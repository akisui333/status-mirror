import { StatusData } from "@/types/status";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export function StatusHero({ data }: { data: StatusData }) {
  const { title } = data.config;

  // Determine overall status
  let overallStatus = "up";
  let statusText = "All Systems Operational";

  const allMonitors = data.publicGroupList.flatMap((g) => g.monitorList || []);

  if (allMonitors.some((m) => m.status === 0)) {
    overallStatus = "down";
    statusText = "Some Systems Are Down";
  } else if (allMonitors.some((m) => m.status === 2 || m.status === 3)) {
    overallStatus = "degraded";
    statusText = "Degraded Performance or Maintenance";
  } else if (data.incident && data.incident.length > 0) {
    overallStatus = "degraded";
    statusText = "Active Incident";
  }

  return (
    <div className="mb-10 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{title}</h1>
        {data.config.description && (
          <p className="text-gray-400 max-w-2xl">{data.config.description}</p>
        )}
      </div>

      <div className={`flex items-center gap-3 px-5 py-3 rounded-full border shadow-lg
        ${overallStatus === 'up' ? 'bg-[#50d39e]/10 border-[#50d39e]/30 text-[#50d39e]' :
          overallStatus === 'down' ? 'bg-red-500/10 border-red-500/30 text-red-500' :
          'bg-yellow-500/10 border-yellow-500/30 text-yellow-500'
        } backdrop-blur-md`}
      >
        {overallStatus === 'up' && <CheckCircle2 className="w-6 h-6" />}
        {overallStatus === 'down' && <XCircle className="w-6 h-6" />}
        {overallStatus === 'degraded' && <AlertTriangle className="w-6 h-6" />}
        <span className="font-semibold">{statusText}</span>
      </div>
    </div>
  );
}
