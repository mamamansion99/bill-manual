# Mama Mansion Bill Creation Webapp

Mobile-first manager webapp for creating one-off tenant bills and sending them to an n8n webhook.

This version is structured for public Vercel deployment. The browser does not contain the Apps Script URL, n8n webhook URL, manager password, or shared secrets.

## Files

- `index.html` - form, loading screen, success screen, and error screen.
- `styles.css` - mobile-first visual styling and loading animation.
- `app.js` - tenant data, bill type defaults, validation, and n8n submit logic.
- `api/login.js` - password login endpoint.
- `api/tenant-lookup.js` - protected Apps Script proxy.
- `api/create-bill.js` - protected n8n proxy.
- `.env.example` - required deployment environment variables.

## Setup

1. Open `app.js`.
2. Confirm the room master list matches `mama_inform_project`.
3. Set the Vercel environment variables below.

## Vercel Environment Variables

Required:

```text
MANAGER_PASSWORD=strong password used on the login screen
AUTH_SECRET=random long string for signing login sessions
APPS_SCRIPT_URL=https://script.google.com/macros/s/.../exec
N8N_WEBHOOK_URL=https://.../webhook/...
```

Optional:

```text
APPS_SCRIPT_SHARED_SECRET=sent as ?secret=... to Apps Script if you add secret checking there
N8N_SHARED_SECRET=sent to n8n as X-Mama-Secret header
```

## Vercel Deploy

1. Import `mamamansion99/bill-manual` into Vercel.
2. Keep the framework preset as `Other`.
3. Leave build command empty.
4. Leave output directory empty.
5. Add all required environment variables.
6. Deploy.

## Security Notes

- Do not put `N8N_WEBHOOK_URL` in `app.js`.
- Do not put `APPS_SCRIPT_URL` in `app.js`.
- Use a strong `MANAGER_PASSWORD`.
- Use a long random `AUTH_SECRET`.
- Add `N8N_SHARED_SECRET` checking inside n8n before creating a bill.
- Add `APPS_SCRIPT_SHARED_SECRET` checking inside Apps Script if tenant lookup should reject direct unauthenticated calls.

## Room Information Lookup

The room selector uses the same `ROOM_IDS` master list from `mama_inform_project`.

Selection flow:

1. Manager selects building.
2. Manager selects floor.
3. Manager selects room ID.
4. Webapp calls:

```text
GET /api/tenant-lookup?roomId=A101
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

The Vercel API route privately calls:

```text
GET {{APPS_SCRIPT_URL}}?action=tenantByRoomId&roomId=A101
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
