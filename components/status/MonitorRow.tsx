import { Monitor } from "@/types/status";
import { UptimeBar } from "./UptimeBar";

export function MonitorRow({ monitor }: { monitor: Monitor }) {
  // Status mapping: 1 = UP, 0 = DOWN, 2 = PENDING, 3 = MAINTENANCE
  const isUp = monitor.status === 1;
  const isDown = monitor.status === 0;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white/[0.02] hover:bg-white/[0.04] transition-colors border-b border-white/5 last:border-b-0 gap-4 sm:gap-0">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
          isUp ? 'bg-[#50d39e] text-white' :
          isDown ? 'bg-red-500 text-white' :
          'bg-yellow-500 text-white'
        }`}>
          {monitor.uptime !== undefined ? `${monitor.uptime}%` : isUp ? '100%' : 'N/A'}
        </div>
        <div className="font-medium text-gray-200">{monitor.name}</div>
      </div>

      <div className="flex flex-col items-end w-full sm:w-auto mt-2 sm:mt-0">
        <div className="w-full overflow-x-auto overflow-y-hidden pb-1 sm:pb-0 scrollbar-hide">
          <div className="min-w-max flex justify-end">
            <UptimeBar heartbeats={monitor.heartbeats || []} monitorName={monitor.name} />
          </div>
        </div>
        <div className="flex justify-between w-full text-[10px] text-gray-500 mt-1 uppercase tracking-wider">
          <span>1h</span>
          <span>Now</span>
        </div>
      </div>
    </div>
  );
}
