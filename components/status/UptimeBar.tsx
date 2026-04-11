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

  // Take the last 60 heartbeats for display (1 hour if 1-minute intervals)
  const displayHeartbeats = heartbeats.slice(-60);

  return (
    <Tooltip.Provider delayDuration={100}>
      <div className="flex items-center gap-[2px]">
        {displayHeartbeats.map((hb, idx) => {
          const isUp = hb.status === 1;
          const isDown = hb.status === 0;
          const isPending = hb.status === 2;

          return (
            <Tooltip.Root key={idx}>
              <Tooltip.Trigger asChild>
                <div
                  className={`w-[3px] h-8 rounded-sm transition-opacity hover:opacity-80 cursor-pointer
                    ${isUp ? 'bg-[#50d39e]' : ''}
                    ${isDown ? 'bg-red-500' : ''}
                    ${isPending ? 'bg-yellow-500' : ''}
                    ${!isUp && !isDown && !isPending ? 'bg-gray-600' : ''}
                  `}
                />
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="bg-[#1e2329] border border-white/10 px-3 py-2 rounded-lg text-xs text-white shadow-xl z-50"
                  sideOffset={5}
                >
                  <div className="flex flex-col gap-1">
                    <div className="font-semibold">{monitorName}</div>
                    <div className={`${isUp ? 'text-[#50d39e]' : isDown ? 'text-red-400' : 'text-yellow-400'}`}>
                      {isUp ? '正常' : isDown ? '故障' : '待定'}
                    </div>
                    <div className="text-gray-400">{new Date(hb.time).toLocaleString('zh-CN')}</div>
                    {hb.ping > 0 && <div className="text-gray-400">{hb.ping}ms</div>}
                    {hb.msg && <div className="text-gray-500 text-xs">{hb.msg}</div>}
                  </div>
                  <Tooltip.Arrow className="fill-[#1e2329]" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          );
        })}
      </div>
    </Tooltip.Provider>
  );
}
