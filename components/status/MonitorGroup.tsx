"use client";

import { MonitorGroup as IMonitorGroup } from "@/types/status";
import { MonitorRow } from "./MonitorRow";

export function MonitorGroup({ group }: { group: IMonitorGroup }) {
  if (!group.monitorList || group.monitorList.length === 0) return null;

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
        <h2 className="text-lg font-medium text-slate-900 sm:text-xl">{group.name}</h2>
      </div>
      <div className="flex flex-col">
        {group.monitorList.map((monitor) => (
          <MonitorRow key={monitor.id} monitor={monitor} />
        ))}
      </div>
    </section>
  );
}
