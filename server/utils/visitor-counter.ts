import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { createHash, randomBytes } from "node:crypto";

const DATA_DIR = join(process.cwd(), "data");
const STATS_FILE = join(DATA_DIR, "visitors.json");

const BOT_PATTERNS = [
  /bot/i,
  /crawl/i,
  /spider/i,
  /slurp/i,
  /feed/i,
  /googlebot/i,
  /bingbot/i,
  /yandex/i,
  /baidu/i,
  /facebookexternalhit/i,
  /twitterbot/i,
  /linkedinbot/i,
  /whatsapp/i,
  /telegrambot/i,
  /discordbot/i,
  /applebot/i,
  /duckduckbot/i,
  /semrush/i,
  /ahrefs/i,
  /gptbot/i,
  /claudebot/i,
  /anthropic/i,
  /chatgpt/i,
  /headless/i,
  /phantom/i,
  /selenium/i,
  /puppeteer/i,
  /lighthouse/i,
  /pagespeed/i,
  /pingdom/i,
  /uptimerobot/i,
];

// Unique visitors are counted per day only. The IP is hashed with a random salt that changes
// every day, and the salt plus all hashes are dropped when the day is over, so a hash can't be
// traced back to an IP afterwards. Monthly and total visitors are sums of the daily counts.
interface Stats {
  views: { total: number; [key: string]: number };
  visitors: { total: number; [key: string]: number };
  /** today's salt and hashes, replaced on the first visit of a new day */
  today?: { date: string; salt: string; seen: string[] };
}

function hashIP(ip: string, salt: string): string {
  return createHash("sha256").update(salt).update(ip).digest("hex");
}

function load(): Stats {
  try {
    if (existsSync(STATS_FILE)) {
      return JSON.parse(readFileSync(STATS_FILE, "utf8"));
    }
  } catch {
    // corrupted file, start fresh
  }
  return { views: { total: 0 }, visitors: { total: 0 } };
}

function save(stats: Stats) {
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(STATS_FILE, JSON.stringify(stats));
}

export function isBot(userAgent: string | undefined): boolean {
  if (!userAgent) return true;
  return BOT_PATTERNS.some((p) => p.test(userAgent));
}

export function trackVisit(ip: string, userAgent: string | undefined) {
  if (isBot(userAgent)) return;

  const stats = load();
  const now = new Date();
  const today = now.toISOString().split("T")[0]!;
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  // a new day: fresh salt, yesterday's hashes are gone
  if (stats.today?.date !== today) {
    stats.today = { date: today, salt: randomBytes(32).toString("hex"), seen: [] };
  }
  // files from the old counter kept unsalted hashes forever
  delete (stats as { ips?: unknown }).ips;

  // views
  stats.views.total = (stats.views.total || 0) + 1;
  stats.views[`day:${today}`] = (stats.views[`day:${today}`] || 0) + 1;
  stats.views[`month:${month}`] = (stats.views[`month:${month}`] || 0) + 1;

  // unique visitors of the day, added up into month and total
  const ipHash = hashIP(ip, stats.today.salt);
  if (!stats.today.seen.includes(ipHash)) {
    stats.today.seen.push(ipHash);
    stats.visitors[`day:${today}`] = (stats.visitors[`day:${today}`] || 0) + 1;
    stats.visitors[`month:${month}`] = (stats.visitors[`month:${month}`] || 0) + 1;
    stats.visitors.total = (stats.visitors.total || 0) + 1;
  }

  save(stats);
}

export function getStats() {
  const stats = load();
  const now = new Date();
  const today = now.toISOString().split("T")[0]!;
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonth = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`;

  return {
    total: {
      views: stats.views.total || 0,
      visitors: stats.visitors.total || 0,
    },
    currentMonth: {
      period: month,
      views: stats.views[`month:${month}`] || 0,
      visitors: stats.visitors[`month:${month}`] || 0,
    },
    previousMonth: {
      period: prevMonth,
      views: stats.views[`month:${prevMonth}`] || 0,
      visitors: stats.visitors[`month:${prevMonth}`] || 0,
    },
    today: {
      date: today,
      views: stats.views[`day:${today}`] || 0,
      visitors: stats.visitors[`day:${today}`] || 0,
    },
  };
}
