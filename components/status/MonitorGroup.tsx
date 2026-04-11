import { MonitorGroup as IMonitorGroup } from "@/types/status";
import { MonitorRow } from "./MonitorRow";

export function MonitorGroup({ group }: { group: IMonitorGroup }) {
  // Skip empty groups
  if (!group.monitorList || group.monitorList.length === 0) return null;

  return (
    <div className="mb-6 rounded-xl overflow-hidden border border-white/10 bg-[#1e2329]/60 backdrop-blur-sm shadow-xl">
      <div className="px-5 py-4 bg-[#2b3038]/80 border-b border-white/5">
        <h2 className="text-lg font-medium text-gray-200">{group.name}</h2>
      </div>
      <div className="flex flex-col">
        {group.monitorList.map((monitor) => (
          <MonitorRow key={monitor.id} monitor={monitor} />
        ))}
      </div>
    </div>
  );
}
