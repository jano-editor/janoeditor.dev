import { trackVisit } from "../utils/visitor-counter";

export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname;
  if (path.startsWith("/api/") || path.startsWith("/_") || path.includes(".")) return;

  const ip = getRequestIP(event, { xForwardedFor: true }) || "unknown";
  const ua = getHeader(event, "user-agent");
  trackVisit(ip, ua);
});
