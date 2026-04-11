import { formatBeijingDateTime } from "@/lib/status/time";
import { Maintenance } from "@/types/status";

export function MaintenancePanel({ maintenances }: { maintenances: Maintenance[] }) {
  if (!maintenances || maintenances.length === 0) return null;

  return (
    <div className="mb-6 flex flex-col gap-4">
      {maintenances.map((m) => (
        <div
          key={m.id}
          className="rounded-xl border border-amber-200 bg-amber-50/80 px-5 py-5"
        >
          <div className="mb-3 flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <h3 className="text-lg font-semibold text-amber-800 sm:text-xl">{m.title}</h3>
          </div>
          <p className="mb-4 text-base leading-7 text-slate-700">{m.description}</p>
          <div className="text-sm text-amber-700">
            {formatBeijingDateTime(m.start_date)} 至 {formatBeijingDateTime(m.end_date)} 北京时间
          </div>
        </div>
      ))}
    </div>
  );
}
