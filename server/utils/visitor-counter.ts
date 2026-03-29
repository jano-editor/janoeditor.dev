import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

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

interface Stats {
  views: { total: number; [key: string]: number };
  visitors: { total: number; [key: string]: number };
  ips: { [key: string]: boolean };
}

function hashIP(ip: string): string {
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

function load(): Stats {
  try {
    if (existsSync(STATS_FILE)) {
      return JSON.parse(readFileSync(STATS_FILE, "utf8"));
    }
  } catch {
    // corrupted file, start fresh
  }
  return { views: { total: 0 }, visitors: { total: 0 }, ips: {} };
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
  const ipHash = hashIP(ip);

  // views
  stats.views.total = (stats.views.total || 0) + 1;
  stats.views[`day:${today}`] = (stats.views[`day:${today}`] || 0) + 1;
  stats.views[`month:${month}`] = (stats.views[`month:${month}`] || 0) + 1;

  // unique visitors
  if (!stats.ips[`day:${today}:${ipHash}`]) {
    stats.ips[`day:${today}:${ipHash}`] = true;
    stats.visitors[`day:${today}`] = (stats.visitors[`day:${today}`] || 0) + 1;
  }
  if (!stats.ips[`month:${month}:${ipHash}`]) {
    stats.ips[`month:${month}:${ipHash}`] = true;
    stats.visitors[`month:${month}`] = (stats.visitors[`month:${month}`] || 0) + 1;
  }
  if (!stats.ips[`total:${ipHash}`]) {
    stats.ips[`total:${ipHash}`] = true;
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
