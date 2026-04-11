import { parseSourceDate } from "@/lib/status/time";
import { Incident } from "@/types/status";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

export function IncidentPanel({ incidents }: { incidents: Incident[] }) {
  if (!incidents || incidents.length === 0) return null;

  return (
    <div className="mb-6 flex flex-col gap-4">
      {incidents.map((incident) => (
        <div
          key={incident.id}
          className="rounded-xl border border-slate-200 bg-white px-5 py-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-xl font-semibold text-slate-900">{incident.title}</h3>
            {incident.pinned && (
              <span className="rounded-md bg-sky-100 px-2.5 py-1 text-sm font-medium text-sky-700">
                置顶
              </span>
            )}
          </div>
          <div
            className="prose prose-slate mb-4 max-w-none text-base"
            dangerouslySetInnerHTML={{ __html: incident.content }}
          />
          <div className="text-sm text-slate-500">
            更新于
            {formatDistanceToNow(
              parseSourceDate(incident.lastUpdatedDate || incident.createdDate),
              { addSuffix: true, locale: zhCN }
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
