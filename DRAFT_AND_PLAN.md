# Draft And Plan

## Draft

Build a mobile-first bill creation webapp for Mama Mansion manager/admin.

Public deployment requirement: keep Apps Script URL, n8n webhook URL, manager password, and shared secrets on the Vercel server side.

The manager flow is:

1. Open webapp.
2. Select building, floor, and room.
3. Auto-load tenant name, phone, move-in date, and lease ID from `mama_inform_project`.
4. Select bill type.
5. Confirm bill title, amount, due date, and note.
6. Send bill to n8n webhook.
7. Show loading state while n8n records the bill and sends LINE Flex.
8. Show success page after n8n confirms creation.
9. Show error state when n8n fails.

Version 1 does not include login, bill history, paid status, or tenant-facing screens.

## Build Plan

1. Create a new standalone folder under `d:\Ma\Mama System`.
2. Build a plain static webapp with `index.html`, `styles.css`, and `app.js`.
3. Reuse the `mama_inform_project` `ROOM_IDS` room master.
4. Add a login gate backed by `MANAGER_PASSWORD`.
5. Fetch tenant details through protected `/api/tenant-lookup`.
6. Create bills through protected `/api/create-bill`.
7. Keep Apps Script and n8n URLs in Vercel environment variables.
8. Send bill payload plus room lookup fields to n8n.
9. Wait for n8n to create the final `BillID`.
10. Render success details from the n8n response.
11. Add a README with setup and webhook contract notes.

## v1 Components

- `BillCreatePage`
- `LoginPage`
- `BillFormCard`
- `RoomSelector`
- `TenantLookupPanel`
- `BillTypeSelector`
- `AmountInput`
- `DueDateInput`
- `DescriptionInput`
- `LoadingScreen`
- `SuccessPage`
- `ErrorState`

## n8n Responsibility

- Append the bill row to the `Bills` Google Sheet.
- Generate the final `BillID`.
- Send LINE Flex to the tenant.
- Return success or error JSON to the webapp.
