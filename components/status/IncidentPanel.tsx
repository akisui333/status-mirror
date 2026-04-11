import { Incident } from "@/types/status";
import { formatDistanceToNow } from "date-fns";

export function IncidentPanel({ incidents }: { incidents: Incident[] }) {
  if (!incidents || incidents.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 mb-8">
      {incidents.map((incident) => (
        <div
          key={incident.id}
          className="rounded-xl p-5 border border-white/10 bg-[#1e2329]/80 backdrop-blur-md"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-semibold text-white">{incident.title}</h3>
            {incident.pinned && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-400">
                Pinned
              </span>
            )}
          </div>
          <div
            className="text-gray-300 text-sm mb-4 prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: incident.content }}
          />
          <div className="text-xs text-gray-500">
            Updated {formatDistanceToNow(new Date(incident.lastUpdatedDate || incident.createdDate), { addSuffix: true })}
          </div>
        </div>
      ))}
    </div>
  );
}
