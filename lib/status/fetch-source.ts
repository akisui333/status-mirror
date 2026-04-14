import { StatusData, MonitorGroup, Incident, Maintenance, Heartbeat } from "@/types/status";
import * as cheerio from "cheerio";
import JSON5 from "json5";

// Keep the last successful snapshot only as an error fallback.
let lastSuccessfulData: StatusData | null = null;
const DEFAULT_MAX_STALE_FALLBACK_SECONDS = 300;
const BRAND_PATTERN = /ciii/gi;
const BRAND_NAME = "深夜食堂";
const DEFAULT_SITE_TITLE = "深夜食堂监控站";

function replaceBrandText(value: string | undefined): string {
  return (value || "").replace(BRAND_PATTERN, BRAND_NAME);
}

function getMaxStaleFallbackMs(): number {
  const rawValue = Number(
    process.env.MAX_STALE_FALLBACK_SECONDS || DEFAULT_MAX_STALE_FALLBACK_SECONDS
  );

  if (!Number.isFinite(rawValue) || rawValue < 0) {
    return DEFAULT_MAX_STALE_FALLBACK_SECONDS * 1000;
  }

  return rawValue * 1000;
}

function getSourceRequestHeaders(): HeadersInit {
  return {
    "User-Agent": process.env.SOURCE_FETCH_USER_AGENT || "Status-Mirror-Bot/1.0",
    Accept: "text/html,application/json;q=0.9,*/*;q=0.8",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
  };
}

async function describeUpstreamError(response: Response, label: string): Promise<string> {
  const bodyPreview = (await response.text()).replace(/\s+/g, " ").trim().slice(0, 240);
  const isCloudflareChallenge = /just a moment|challenge-platform|cf-browser-verification/i.test(
    bodyPreview
  );

  return [
    `${label} returned ${response.status} ${response.statusText}`,
    isCloudflareChallenge ? "possible Cloudflare anti-bot challenge" : null,
    bodyPreview ? `body preview: ${bodyPreview}` : null,
  ]
    .filter(Boolean)
    .join(" | ");
}

function createStaleSnapshot(data: StatusData, fetchError: string): StatusData {
  return {
    ...data,
    meta: {
      isStale: true,
      fetchError,
      lastSuccessfulAt: data.lastUpdated,
    },
  };
}

// Enrich monitor data with heartbeat history and calculate uptime
function enrichDataWithHeartbeats(data: StatusData, heartbeatList: Record<string, Heartbeat[]>) {
  for (const group of data.publicGroupList) {
    for (const monitor of group.monitorList) {
      const heartbeats = heartbeatList[monitor.id.toString()];
      if (heartbeats && heartbeats.length > 0) {
        monitor.heartbeats = heartbeats
          .slice()
          .sort(
            (left, right) => new Date(left.time).getTime() - new Date(right.time).getTime()
          )
          .slice(-120)
          .map((heartbeat) => ({
            ...heartbeat,
            msg: replaceBrandText(heartbeat.msg),
          })); // Keep reasonable history limit

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
  const requestHeaders = getSourceRequestHeaders();
  const maxStaleFallbackMs = getMaxStaleFallbackMs();

  try {
    // Always request the latest source data for this page render.
    const [htmlResponse, heartbeatResponse] = await Promise.all([
      fetch(sourceUrl, {
        cache: "no-store",
        headers: requestHeaders,
      }),
      fetch(heartbeatUrl, {
        cache: "no-store",
        headers: requestHeaders,
      }).catch(e => {
        console.warn("Failed to fetch heartbeat data, falling back to empty heartbeats", e);
        return null;
      })
    ]);

    if (!htmlResponse.ok) {
      throw new Error(await describeUpstreamError(htmlResponse, "Source status page"));
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
    } else if (heartbeatResponse) {
      console.warn(await describeUpstreamError(heartbeatResponse, "Heartbeat API"));
    }

    lastSuccessfulData = data;

    return data;
  } catch (error) {
    console.error("Error fetching status data:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown upstream fetch error";

    // Return the last good snapshot only if the source is temporarily failing.
    if (lastSuccessfulData) {
      const lastSuccessTime = Date.parse(lastSuccessfulData.lastUpdated);
      const fallbackAgeMs = Number.isNaN(lastSuccessTime)
        ? Number.POSITIVE_INFINITY
        : Date.now() - lastSuccessTime;

      if (fallbackAgeMs <= maxStaleFallbackMs) {
        console.warn("Serving stale cached data due to fetch error", {
          fallbackAgeMs,
          maxStaleFallbackMs,
        });
        return createStaleSnapshot(lastSuccessfulData, errorMessage);
      }

      console.error("Cached snapshot is too old to serve safely", {
        fallbackAgeMs,
        maxStaleFallbackMs,
      });
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
  const groups = ((rawData.publicGroupList as MonitorGroup[]) || []).map((group) => ({
    ...group,
    name: replaceBrandText(group.name),
    monitorList: (group.monitorList || []).map((monitor) => ({
      ...monitor,
      name: replaceBrandText(monitor.name),
    })),
  }));
  const incidents = ((rawData.incident as Incident[]) || []).map((incident) => ({
    ...incident,
    title: replaceBrandText(incident.title),
    content: replaceBrandText(incident.content),
  }));
  const maintenances = ((rawData.maintenanceList as Maintenance[]) || []).map(
    (maintenance) => ({
      ...maintenance,
      title: replaceBrandText(maintenance.title),
      description: replaceBrandText(maintenance.description),
      status: replaceBrandText(maintenance.status),
    })
  );
  const siteTitle = process.env.SITE_TITLE || DEFAULT_SITE_TITLE;

  return {
    config: {
      title: siteTitle,
      description: replaceBrandText((config?.description as string) || ""),
      footerText: replaceBrandText((config?.footerText as string) || ""),
      theme: (config?.theme as string) || "dark",
    },
    publicGroupList: groups,
    incident: incidents,
    maintenanceList: maintenances,
    lastUpdated: new Date().toISOString(),
  };
}
