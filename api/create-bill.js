const { readJsonBody, requireAuth, sendJson } = require("./_auth");

function validateBillPayload(payload) {
  const required = ["room", "building", "floor", "tenantName", "billType", "billTitle", "amountDue", "dueDate", "createdBy"];
  for (const key of required) {
    if (!payload[key]) {
      return `${key} is required`;
    }
  }

  const amount = Number(payload.amountDue);
  if (!Number.isFinite(amount) || amount <= 0) {
    return "amountDue must be greater than 0";
  }

  return "";
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { success: false, message: "Method not allowed" });
    return;
  }

  if (!requireAuth(req, res)) {
    return;
  }

  const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || "";
  if (!n8nWebhookUrl) {
    sendJson(res, 500, { success: false, message: "N8N_WEBHOOK_URL is not configured" });
    return;
  }

  try {
    const payload = await readJsonBody(req);
    const validationMessage = validateBillPayload(payload);
    if (validationMessage) {
      sendJson(res, 400, { success: false, message: validationMessage });
      return;
    }

    const response = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.N8N_SHARED_SECRET ? { "X-Mama-Secret": process.env.N8N_SHARED_SECRET } : {}),
      },
      body: JSON.stringify(payload),
    });

    const raw = await response.text();
    let result;
    try {
      result = JSON.parse(raw);
    } catch {
      result = { success: false, message: raw || "n8n returned a non-JSON response" };
    }

    if (!response.ok) {
      sendJson(res, response.status, {
        success: false,
        message: result.message || "n8n request failed",
      });
      return;
    }

    sendJson(res, 200, result);
  } catch (error) {
    sendJson(res, 502, { success: false, message: error.message || "Create bill failed" });
  }
};
