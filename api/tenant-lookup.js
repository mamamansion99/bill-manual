const { requireAuth, sendJson } = require("./_auth");

function getRoomId(req) {
  const baseUrl = `https://${req.headers.host || "localhost"}`;
  const url = new URL(req.url || "", baseUrl);
  return String(url.searchParams.get("roomId") || "").trim().toUpperCase();
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    sendJson(res, 405, { success: false, message: "Method not allowed" });
    return;
  }

  if (!requireAuth(req, res)) {
    return;
  }

  const appsScriptUrl = process.env.APPS_SCRIPT_URL || "";
  if (!appsScriptUrl) {
    sendJson(res, 500, { ok: false, error: "APPS_SCRIPT_URL is not configured" });
    return;
  }

  const roomId = getRoomId(req);
  if (!/^[AB]\d{3}$/.test(roomId)) {
    sendJson(res, 400, { ok: false, error: "Invalid roomId" });
    return;
  }

  try {
    const url = new URL(appsScriptUrl);
    url.searchParams.set("action", "tenantByRoomId");
    url.searchParams.set("roomId", roomId);

    if (process.env.APPS_SCRIPT_SHARED_SECRET) {
      url.searchParams.set("secret", process.env.APPS_SCRIPT_SHARED_SECRET);
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Cache-Control": "no-store",
      },
    });
    const raw = await response.text();
    const parsed = JSON.parse(raw);

    if (!response.ok) {
      sendJson(res, response.status, { ok: false, error: parsed.error || "Tenant lookup failed" });
      return;
    }

    sendJson(res, 200, parsed);
  } catch (error) {
    sendJson(res, 502, { ok: false, error: error.message || "Tenant lookup failed" });
  }
};
