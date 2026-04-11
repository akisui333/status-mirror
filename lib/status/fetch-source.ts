import { StatusData, MonitorGroup, Incident, Maintenance, Heartbeat } from "@/types/status";
import * as cheerio from "cheerio";
import JSON5 from "json5";

// Internal cache to prevent spamming the source site
let cachedData: StatusData | null = null;
let lastFetchTime = 0;

// Enrich monitor data with heartbeat history and calculate uptime
function enrichDataWithHeartbeats(data: StatusData, heartbeatList: Record<string, Heartbeat[]>) {
  for (const group of data.publicGroupList) {
    for (const monitor of group.monitorList) {
      const heartbeats = heartbeatList[monitor.id.toString()];
      if (heartbeats && heartbeats.length > 0) {
        monitor.heartbeats = heartbeats.slice(-120); // Keep reasonable history limit

        const total = monitor.heartbeats.length;
        const upCount = monitor.heartbeats.filter(h => h.status === 1).length;
        monitor.uptime = total > 0 ? Math.round((upCount / total) * 10000) / 100 : 100;
      }
    }
  }
}

export async function fetchStatusData(): Promise<StatusData> {
  const sourceUrl = process.env.SOURCE_STATUS_URL || "https://status.ciii.club/status/codex";
  // The slug is the last part of the URL, e.g., 'codex'
  const slug = sourceUrl.split('/').filter(Boolean).pop() || "codex";
  const heartbeatUrl = sourceUrl.replace(`/status/${slug}`, `/api/status-page/heartbeat/${slug}`);

  const cacheTtl = parseInt(process.env.CACHE_TTL || "60", 10) * 1000;

  const now = Date.now();
  if (cachedData && now - lastFetchTime < cacheTtl) {
    return cachedData;
  }

  try {
    // We try to fetch the initial preload data from HTML
    const [htmlResponse, heartbeatResponse] = await Promise.all([
      fetch(sourceUrl, {
        next: { revalidate: cacheTtl / 1000 },
        headers: { "User-Agent": "Status-Mirror-Bot/1.0" }
      }),
      fetch(heartbeatUrl, {
        next: { revalidate: cacheTtl / 1000 },
        headers: { "User-Agent": "Status-Mirror-Bot/1.0" }
      }).catch(e => {
        console.warn("Failed to fetch heartbeat data, falling back to empty heartbeats", e);
        return null;
      })
    ]);

    if (!htmlResponse.ok) {
      throw new Error(`Failed to fetch source: ${htmlResponse.status} ${htmlResponse.statusText}`);
    }

    const html = await htmlResponse.text();
    const data = parsePreloadData(html);

    // Enrich with heartbeat data if available
    if (heartbeatResponse && heartbeatResponse.ok) {
      try {
        const heartbeatData = await heartbeatResponse.json();
        if (heartbeatData && heartbeatData.heartbeatList) {
          enrichDataWithHeartbeats(data, heartbeatData.heartbeatList);
        }
      } catch (e) {
        console.warn("Failed to parse heartbeat data", e);
      }
    }

    cachedData = data;
    lastFetchTime = now;

    return data;
  } catch (error) {
    console.error("Error fetching status data:", error);

    // Return stale cache if available, otherwise throw
    if (cachedData) {
      console.warn("Serving stale cached data due to fetch error");
      return cachedData;
    }

    throw error;
  }
}

function parsePreloadData(html: string): StatusData {
  // Try to find the window.preloadData assignment in script tags
  // Uptime Kuma uses single quotes in JSON-like format: window.preloadData = {'key':'value'}
  const match = html.match(/window\.preloadData\s*=\s*(\{[\s\S]*?\});/);

  if (match && match[1]) {
    try {
      // Use JSON5 which handles single quotes and unquoted keys
      const rawData = JSON5.parse(match[1]);
      return normalizeStatusData(rawData);
    } catch (e) {
      console.error("Failed to parse preloadData JSON5:", e);
    }
  }

  // Fallback: try parsing with Cheerio if regex fails
  const $ = cheerio.load(html);
  let parsed: Record<string, unknown> | null = null;

  $("script").each((_, el) => {
    const content = $(el).html() || "";
    if (content.includes("window.preloadData")) {
      const fbMatch = content.match(/window\.preloadData\s*=\s*(\{[\s\S]*?\});/);
      if (fbMatch && fbMatch[1]) {
        try {
          parsed = JSON5.parse(fbMatch[1]);
        } catch {
          // Ignore parse errors in fallback
        }
      }
    }
  });

  if (parsed) {
    return normalizeStatusData(parsed);
  }

  throw new Error("Could not extract preloadData from source HTML");
}

// Normalize the Uptime Kuma specific data format to our generic format
function normalizeStatusData(rawData: Record<string, unknown>): StatusData {
  const config = rawData.config as Record<string, unknown> | undefined;

  return {
    config: {
      title: process.env.SITE_TITLE || (config?.title as string) || "Status",
      description: (config?.description as string) || "",
      footerText: (config?.footerText as string) || "",
      theme: (config?.theme as string) || "dark",
    },
    publicGroupList: (rawData.publicGroupList as MonitorGroup[]) || [],
    incident: (rawData.incident as Incident[]) || [],
    maintenanceList: (rawData.maintenanceList as Maintenance[]) || [],
    lastUpdated: new Date().toISOString(),
  };
}
