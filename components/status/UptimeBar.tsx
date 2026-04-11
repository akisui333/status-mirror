"use client";

import { formatBeijingDateTime } from "@/lib/status/time";
import { Heartbeat } from "@/types/status";
import * as Tooltip from "@radix-ui/react-tooltip";

interface UptimeBarProps {
  heartbeats: Heartbeat[];
  monitorName: string;
}

export function UptimeBar({ heartbeats, monitorName }: UptimeBarProps) {
  if (!heartbeats || heartbeats.length === 0) {
    return null;
  }

  const displayHeartbeats = heartbeats.slice(-60);

  return (
    <Tooltip.Provider delayDuration={100}>
      <div
        className="grid w-full gap-[4px]"
        style={{
          gridTemplateColumns: `repeat(${displayHeartbeats.length}, minmax(0, 1fr))`,
        }}
      >
        {displayHeartbeats.map((hb, idx) => {
          const isUp = hb.status === 1;
          const isDown = hb.status === 0;
          const isPending = hb.status === 2;
          const statusText = isUp ? "正常" : isDown ? "故障" : isPending ? "待定" : "未知";

          return (
            <Tooltip.Root key={`${hb.time}-${idx}`}>
              <Tooltip.Trigger asChild>
                <button
                  type="button"
                  aria-label={`${monitorName}：${statusText}`}
                  className={`h-6 w-full min-w-0 rounded-[3px] transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${
                    isUp ? "bg-emerald-400" : ""
                  } ${isDown ? "bg-red-400" : ""} ${
                    isPending ? "bg-amber-400" : ""
                  } ${!isUp && !isDown && !isPending ? "bg-slate-300" : ""}`}
                />
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="z-50 rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 shadow-[0_12px_32px_rgba(15,23,42,0.12)]"
                  sideOffset={8}
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="font-semibold">{monitorName}</div>
                    <div
                      className={
                        isUp
                          ? "text-emerald-600"
                          : isDown
                            ? "text-red-600"
                            : "text-amber-600"
                      }
                    >
                      {statusText}
                    </div>
                    <div className="text-slate-500">
                      {formatBeijingDateTime(hb.time)} 北京时间
                    </div>
                    {hb.ping > 0 && <div className="text-slate-500">{hb.ping}ms</div>}
                    {hb.msg && <div className="text-slate-400">{hb.msg}</div>}
                  </div>
                  <Tooltip.Arrow className="fill-white" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          );
        })}
      </div>
    </Tooltip.Provider>
  );
}
