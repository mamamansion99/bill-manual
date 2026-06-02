# Draft And Plan

## Draft

Build a mobile-first bill creation webapp for Mama Mansion manager/admin.

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
4. Fetch tenant details from `GET ?action=tenantByRoomId&roomId={{roomId}}`.
5. Keep the n8n webhook URL configurable in `app.js`.
6. Send bill payload plus room lookup fields to n8n.
7. Wait for n8n to create the final `BillID`.
8. Render success details from the n8n response.
9. Add a README with setup and webhook contract notes.

## v1 Components

- `BillCreatePage`
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
