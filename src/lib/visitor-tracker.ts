/* mr.havath */

export interface VisitorLog {
  id: string;
  created_at: string;
  ip: string;
  location: string;
  device: string;
  referrer: string;
  screen_resolution: string;
}

const LOCAL_STORAGE_KEY = "hadhi_portfolio_visitor_logs";

function getCleanUserAgent(): string {
  if (typeof window === "undefined") return "Server";
  const ua = navigator.userAgent;
  let browser = "Unknown";
  let os = "Unknown OS";

  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
  else if (ua.includes("Edge")) browser = "Edge";
  else if (ua.includes("OPR") || ua.includes("Opera")) browser = "Opera";

  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Macintosh")) os = "macOS";
  else if (ua.includes("Linux") && !ua.includes("Android")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  return `${browser} on ${os}`;
}

export async function trackVisit(): Promise<void> {
  if (typeof window === "undefined") return;

  // Prevent double tracking in the same session tab if desired,
  // but standard practice is to track page loads.
  const sessionKey = "hadhi_portfolio_tracked";
  if (sessionStorage.getItem(sessionKey)) return;
  sessionStorage.setItem(sessionKey, "true");

  try {
    // 1. Gather location and IP from a free service
    let ip = "127.0.0.1";
    let location = "Localhost";
    
    try {
      const geoRes = await fetch("https://ipapi.co/json/");
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        ip = geoData.ip || "Unknown IP";
        location = `${geoData.city || ""}, ${geoData.region || ""}, ${geoData.country_name || ""}`.replace(/^,\s*|,\s*$/, "");
        if (!location.trim()) location = "Unknown Location";
      }
    } catch {
      // Fallback if API fails or rate limited
      location = "Unavailable";
    }

    const log: VisitorLog = {
      id: Math.random().toString(36).substring(2, 11),
      created_at: new Date().toISOString(),
      ip,
      location,
      device: getCleanUserAgent(),
      referrer: document.referrer || "Direct",
      screen_resolution: `${window.screen.width}x${window.screen.height}`,
    };

    // 2. Check if Supabase is configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      // Send to Supabase Rest API directly to avoid importing heavy Supabase Client
      await fetch(`${supabaseUrl}/rest/v1/visitor_logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseAnonKey,
          "Authorization": `Bearer ${supabaseAnonKey}`,
          "Prefer": "return=minimal"
        },
        body: JSON.stringify({
          ip: log.ip,
          location: log.location,
          device: log.device,
          referrer: log.referrer,
          screen_resolution: log.screen_resolution
        })
      });
    } else {
      // Save locally to localStorage as fallback/demo
      const existingLogs: VisitorLog[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
      existingLogs.unshift(log);
      // Keep only last 50 logs locally to save space
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existingLogs.slice(0, 50)));
    }
  } catch (error) {
    console.error("Failed to log visitor:", error);
  }
}

export async function fetchVisitorLogs(): Promise<VisitorLog[]> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/visitor_logs?select=*&order=created_at.desc&limit=50`, {
        method: "GET",
        headers: {
          "apikey": supabaseAnonKey,
          "Authorization": `Bearer ${supabaseAnonKey}`,
        }
      });
      if (res.ok) {
        return await res.json();
      }
      throw new Error(`Supabase query failed with status: ${res.status}`);
    } catch (error) {
      console.error("Failed to fetch logs from Supabase:", error);
      return [];
    }
  } else {
    // Fetch from localStorage fallback
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
  }
}
