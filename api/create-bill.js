const { readJsonBody, sendJson } = require("./_auth");

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

  if (payload.billType === "PARKING" && !payload.parkingUntilDate) {
    return "parkingUntilDate is required for PARKING bills";
  }

  if (payload.billType === "PARKING" && !payload.carBrand) {
    return "carBrand is required for PARKING bills";
  }

  if (payload.billType === "PARKING" && !payload.carPlateNumber) {
    return "carPlateNumber is required for PARKING bills";
  }

  return "";
}

function normalizeN8nResult({ raw, response, payload }) {
  let parsed = null;
  try {
    parsed = raw ? JSON.parse(raw) : null;
  } catch {
    parsed = null;
  }

  if (response.ok) {
    const normalized = {
      success: true,
      billId: "",
      room: payload.room,
      billTitle: payload.billTitle,
      amountDue: payload.amountDue,
      status: "Workflow Started",
      message: raw || "Workflow was started",
      responseMode: "immediate",
    };

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return {
        ...normalized,
        ...parsed,
        success: true,
        billId: parsed.billId || parsed.BillID || parsed.billID || normalized.billId,
        room: parsed.room || parsed.roomId || normalized.room,
        billTitle: parsed.billTitle || parsed.title || normalized.billTitle,
        amountDue: parsed.amountDue || parsed.amount || normalized.amountDue,
        status: parsed.status || normalized.status,
        message: parsed.message || normalized.message,
        responseMode: parsed.responseMode || normalized.responseMode,
      };
    }

    return normalized;
  }

  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    return {
      ...parsed,
      success: false,
      message: parsed.message || parsed.error || raw || "n8n request failed",
    };
  }

  return {
    success: false,
    message: raw || "n8n returned a non-JSON response",
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { success: false, message: "Method not allowed" });
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
    const result = normalizeN8nResult({ raw, response, payload });

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
