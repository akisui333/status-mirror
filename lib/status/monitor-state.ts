import { Monitor, StatusData } from "@/types/status";

type MonitorStatus = 0 | 1 | 2 | 3;
type OverallStatus = "up" | "down" | "degraded";

function isMonitorStatus(status: number | undefined): status is MonitorStatus {
  return status === 0 || status === 1 || status === 2 || status === 3;
}

export function getMonitorCurrentStatus(monitor: Monitor): MonitorStatus | undefined {
  const latestHeartbeatStatus = monitor.heartbeats?.[monitor.heartbeats.length - 1]?.status;

  if (isMonitorStatus(latestHeartbeatStatus)) {
    return latestHeartbeatStatus;
  }

  if (isMonitorStatus(monitor.status)) {
    return monitor.status;
  }

  return undefined;
}

export function getOverallStatusSummary(data: StatusData): {
  overallStatus: OverallStatus;
  statusText: string;
} {
  const allStatuses = data.publicGroupList
    .flatMap((group) => group.monitorList || [])
    .map(getMonitorCurrentStatus);

  if (allStatuses.some((status) => status === 0)) {
    return {
      overallStatus: "down",
      statusText: "部分服务不可用",
    };
  }

  if (allStatuses.some((status) => status === 2 || status === 3)) {
    return {
      overallStatus: "degraded",
      statusText: "性能下降或维护中",
    };
  }

  if (data.incident.length > 0) {
    return {
      overallStatus: "degraded",
      statusText: "当前存在事件",
    };
  }

  return {
    overallStatus: "up",
    statusText: "全部服务运行正常",
  };
}
