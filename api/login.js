const { createSessionToken, readJsonBody, safeEqual, sendJson } = require("./_auth");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { success: false, message: "Method not allowed" });
    return;
  }

  const managerPassword = process.env.MANAGER_PASSWORD || "";
  if (!managerPassword) {
    sendJson(res, 500, { success: false, message: "MANAGER_PASSWORD is not configured" });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const password = String(body.password || "");

    if (!safeEqual(password, managerPassword)) {
      sendJson(res, 401, { success: false, message: "รหัสผ่านไม่ถูกต้อง" });
      return;
    }

    sendJson(res, 200, {
      success: true,
      token: createSessionToken(),
      expiresInSeconds: 12 * 60 * 60,
    });
  } catch (error) {
    sendJson(res, 400, { success: false, message: error.message });
  }
};
