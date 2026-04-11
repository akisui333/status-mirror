export interface Heartbeat {
  status: number; // 0=down, 1=up, 2=pending, 3=maintenance
  time: string;
  msg: string;
  ping: number;
}

export interface Monitor {
  id: number;
  name: string;
  type?: string;
  status?: number; // 0=down, 1=up, 2=pending, 3=maintenance
  ping?: number; // Response time in ms
  heartbeats?: Heartbeat[]; // Up to 60-120 latest heartbeats
  uptime?: number; // Percentage like 98.48
}

export interface MonitorGroup {
  id: number;
  name: string;
  weight?: number;
  monitorList: Monitor[];
}

export interface Incident {
  id: number;
  title: string;
  content: string;
  style: string; // "info", "warning", "danger", etc.
  createdDate: string;
  lastUpdatedDate?: string;
  pinned?: boolean;
}

export interface Maintenance {
  id: number;
  title: string;
  description: string;
  status: string; // "active", "upcoming", "ended"
  start_date: string;
  end_date: string;
}

export interface StatusData {
  config: {
    title: string;
    description?: string;
    footerText?: string;
    showTags?: boolean;
    theme?: string;
  };
  publicGroupList: MonitorGroup[];
  incident: Incident[];
  maintenanceList: Maintenance[];
  lastUpdated: string; // ISO string when data was fetched
}
