# Mama Mansion Bill Creation Webapp

Mobile-first manager webapp for creating one-off tenant bills and sending them to an n8n webhook.

## Files

- `index.html` - form, loading screen, success screen, and error screen.
- `styles.css` - mobile-first visual styling and loading animation.
- `app.js` - tenant data, bill type defaults, validation, and n8n submit logic.

## Setup

1. Open `app.js`.
2. Set `N8N_WEBHOOK_URL` to the production n8n webhook URL.
3. Confirm `APPS_SCRIPT_URL` points to the public `mama_inform_project` Apps Script deployment.
4. Set `DEMO_MODE_WHEN_WEBHOOK_EMPTY` to `false` when the app must require a webhook.

## Room Information Lookup

The room selector uses the same `ROOM_IDS` master list from `mama_inform_project`.

Selection flow:

1. Manager selects building.
2. Manager selects floor.
3. Manager selects room ID.
4. Webapp calls:

```text
GET {{APPS_SCRIPT_URL}}?action=tenantByRoomId&roomId=A101
```

Expected room lookup response:

```json
{
  "ok": true,
  "data": {
    "name": "TestCloudfare1",
    "phone": "1234567890",
    "moveInDate": "",
    "leaseId": "LSE-000186",
    "warningCount": 3,
    "warningLimit": 3
  }
}
```

`mama_inform_project` does not currently return LINE User ID, so this webapp keeps `tenantLineUserId` optional and sends `room`, `tenantPhone`, and `tenantLeaseId` for n8n lookup or downstream matching.

## Payload Sent To n8n

```json
{
  "room": "A101",
  "building": "A",
  "floor": "1",
  "roomNo": "101",
  "tenantName": "คุณสมชาย",
  "tenantLineUserId": "",
  "tenantPhone": "1234567890",
  "tenantMoveInDate": "2026-06-03",
  "tenantLeaseId": "LSE-000186",
  "billType": "CLEANING",
  "billTitle": "ค่าบริการทำความสะอาด",
  "billDescription": "ทำความสะอาดหลังย้ายออก",
  "amountDue": 500,
  "dueDate": "2026-06-03",
  "createdBy": "Ma",
  "source": "WEBAPP_BILL_CREATE"
}
```

## Expected Success Response

```json
{
  "success": true,
  "billId": "BILL-20260602-1234",
  "room": "A101",
  "billTitle": "ค่าบริการทำความสะอาด",
  "amountDue": 500,
  "status": "Awaiting Payment",
  "message": "Bill created and sent to tenant successfully."
}
```

## Expected Error Response

```json
{
  "success": false,
  "errorCode": "TENANT_LINE_ID_NOT_FOUND",
  "message": "ไม่พบ LINE User ID ของห้องนี้"
}
```

## Draft Scope

Version 1 intentionally includes only the core manager flow:

- Create bill form.
- Loading screen.
- n8n webhook submit.
- Success page.
- Error state.

No login, bill history, or tenant-facing payment status screen is included yet.
