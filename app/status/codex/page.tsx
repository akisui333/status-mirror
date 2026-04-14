import { StatusPageClient } from "@/components/status/StatusPageClient";

export default function CodexStatusPage() {
  return <StatusPageClient intervalMs={30_000} />;
}
