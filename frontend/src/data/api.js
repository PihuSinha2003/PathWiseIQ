import * as mock from "./mock.js";

const BASE = "/api";

async function safeGet(path, fallback) {
  try {
    const res = await fetch(`${BASE}${path}`);
    if (!res.ok) throw new Error(`${res.status}`);
    const data = await res.json();
    if (Array.isArray(data) ? data.length === 0 : Object.keys(data).length === 0) return fallback;
    return data;
  } catch {
    return fallback;
  }
}

export const api = {
  overview:        () => safeGet("/analytics/overview", mock.overview),
  funnel:          (device, variant) => {
    const qs = new URLSearchParams();
    if (device)  qs.set("device", device);
    if (variant) qs.set("variant", variant);
    const fallback = device === "desktop" ? mock.funnelDesktop
                    : device === "mobile" ? mock.funnelMobile : mock.funnel;
    return safeGet(`/analytics/funnel?${qs.toString()}`, fallback);
  },
  cohorts:         () => safeGet("/analytics/cohorts", mock.cohorts),
  experiment:      () => safeGet("/analytics/experiment", mock.experiment),
  insights:        () => safeGet("/analytics/insights", mock.insights),
  recommendations: () => safeGet("/analytics/recommendations", mock.recommendations),
};

const anonId = (() => {
  const key = "pathwise_anon_id";
  let v = localStorage.getItem(key);
  if (!v) { v = crypto.randomUUID(); localStorage.setItem(key, v); }
  return v;
})();

export const track = async (name, properties = {}, userId = null) => {
  const payload = {
    name,
    user_id: userId,
    anonymous_id: userId ? null : anonId,
    properties,
  };
  try {
    await fetch(`${BASE}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // backend might not be running; that's fine, dashboard uses mock data
  }
  if (import.meta.env.DEV) console.log("[track]", name, properties);
};
