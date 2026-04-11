import { Maintenance } from "@/types/status";

export function MaintenancePanel({ maintenances }: { maintenances: Maintenance[] }) {
  if (!maintenances || maintenances.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 mb-8">
      {maintenances.map((m) => (
        <div
          key={m.id}
          className="rounded-xl p-5 border border-yellow-500/20 bg-yellow-500/5 backdrop-blur-md"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
            <h3 className="text-lg font-semibold text-yellow-500">{m.title}</h3>
          </div>
          <p className="text-gray-300 text-sm mb-3">{m.description}</p>
          <div className="text-xs text-yellow-600/80">
            {new Date(m.start_date).toLocaleString()} - {new Date(m.end_date).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}
