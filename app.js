const SESSION_TOKEN_KEY = "mama_bill_manager_session";

const ROOM_IDS = [
  "A601",
  "A602",
  "A101",
  "A102",
  "A103",
  "A104",
  "A105",
  "A106",
  "A107",
  "A108",
  "A109",
  "A110",
  "A111",
  "A201",
  "A202",
  "A203",
  "A204",
  "A205",
  "A206",
  "A207",
  "A208",
  "A209",
  "A210",
  "A211",
  "A212",
  "A213",
  "A214",
  "A215",
  "A301",
  "A302",
  "A303",
  "A304",
  "A305",
  "A306",
  "A307",
  "A308",
  "A309",
  "A310",
  "A311",
  "A312",
  "A313",
  "A314",
  "A315",
  "A401",
  "A402",
  "A403",
  "A404",
  "A405",
  "A406",
  "A407",
  "A408",
  "A409",
  "A410",
  "A411",
  "A412",
  "A413",
  "A414",
  "A415",
  "A501",
  "A502",
  "A503",
  "A504",
  "A505",
  "A506",
  "A507",
  "A508",
  "A509",
  "A510",
  "A511",
  "A512",
  "A513",
  "A514",
  "A515",
  "B601",
  "B602",
  "B101",
  "B102",
  "B103",
  "B104",
  "B105",
  "B106",
  "B107",
  "B108",
  "B109",
  "B110",
  "B111",
  "B112",
  "B201",
  "B202",
  "B203",
  "B204",
  "B205",
  "B206",
  "B207",
  "B208",
  "B209",
  "B210",
  "B211",
  "B212",
  "B213",
  "B214",
  "B215",
  "B301",
  "B302",
  "B303",
  "B304",
  "B305",
  "B306",
  "B307",
  "B308",
  "B309",
  "B310",
  "B311",
  "B312",
  "B313",
  "B314",
  "B315",
  "B401",
  "B402",
  "B403",
  "B404",
  "B405",
  "B406",
  "B407",
  "B408",
  "B409",
  "B410",
  "B411",
  "B412",
  "B413",
  "B414",
  "B415",
  "B501",
  "B502",
  "B503",
  "B504",
  "B505",
  "B506",
  "B507",
  "B508",
  "B509",
  "B510",
  "B511",
  "B512",
  "B513",
  "B514",
  "B515",
];

const BILL_TYPE_DEFAULTS = {
  CLEANING: {
    title: "ค่าบริการทำความสะอาด",
    defaultAmount: 500,
    requireDescription: false,
  },
  KEY: {
    title: "ค่ากุญแจ",
    defaultAmount: 200,
    requireDescription: false,
  },
  DAMAGE: {
    title: "ค่าเสียหาย",
    defaultAmount: "",
    requireDescription: true,
  },
  PARKING: {
    title: "ค่าที่จอดรถ",
    defaultAmount: 500,
    requireDescription: false,
  },
  UTILITY: {
    title: "ค่าสาธารณูปโภค",
    defaultAmount: "",
    requireDescription: true,
  },
  OTHER: {
    title: "ค่าใช้จ่ายอื่น ๆ",
    defaultAmount: "",
    requireDescription: true,
  },
};

const roomMaster = ROOM_IDS.map(parseRoomId).filter((room) => room.building && room.floor && room.roomId);
const dateOnlyFormatter = new Intl.DateTimeFormat("th-TH", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const screens = {
  login: document.querySelector("#login-screen"),
  form: document.querySelector("#form-screen"),
  loading: document.querySelector("#loading-screen"),
  success: document.querySelector("#success-screen"),
  error: document.querySelector("#error-screen"),
};

const loginForm = document.querySelector("#login-form");
const managerPasswordInput = document.querySelector("#manager-password");
const loginButton = document.querySelector("#login-button");
const loginError = document.querySelector("#login-error");
const form = document.querySelector("#bill-form");
const fields = {
  building: document.querySelector("#building"),
  floor: document.querySelector("#floor"),
  room: document.querySelector("#room"),
  tenantName: document.querySelector("#tenant-name"),
  tenantLineUserId: document.querySelector("#tenant-line-user-id"),
  tenantPhone: document.querySelector("#tenant-phone"),
  tenantMoveInDate: document.querySelector("#tenant-move-in-date"),
  tenantLeaseId: document.querySelector("#tenant-lease-id"),
  billType: document.querySelector("#bill-type"),
  billTitle: document.querySelector("#bill-title"),
  amountDue: document.querySelector("#amount-due"),
  dueDate: document.querySelector("#due-date"),
  billDescription: document.querySelector("#bill-description"),
  createdBy: document.querySelector("#created-by"),
};

const tenantLookupStatus = document.querySelector("#tenant-lookup-status");
const tenantLookupDetails = document.querySelector("#tenant-lookup-details");
const tenantPhoneDisplay = document.querySelector("#tenant-phone-display");
const tenantMoveInDisplay = document.querySelector("#tenant-move-in-display");
const tenantLeaseDisplay = document.querySelector("#tenant-lease-display");
const formError = document.querySelector("#form-error");
const submitButton = document.querySelector("#submit-button");
const resetButton = document.querySelector("#reset-button");
const retryButton = document.querySelector("#retry-button");
const editButton = document.querySelector("#edit-button");
const newBillButton = document.querySelector("#new-bill-button");
const logoutButton = document.querySelector("#logout-button");
const errorDetail = document.querySelector("#error-detail");

let lastPayload = null;
let tenantLookupController = null;

function parseRoomId(roomId) {
  const value = String(roomId || "").trim().toUpperCase();
  const building = value.charAt(0);
  const roomNo = value.slice(1);
  const floor = roomNo.charAt(0);
  return { building, floor, roomNo, roomId: value };
}

function createOption(value, label = value) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = label;
  return option;
}

function parseJsonText(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function getSessionToken() {
  return sessionStorage.getItem(SESSION_TOKEN_KEY) || "";
}

function setSessionToken(token) {
  sessionStorage.setItem(SESSION_TOKEN_KEY, token);
}

function clearSessionToken() {
  sessionStorage.removeItem(SESSION_TOKEN_KEY);
}

function formatDateOnly(dateText) {
  if (!dateText) {
    return "-";
  }

  const candidate = dateText.includes("T") ? dateText : `${dateText}T12:00:00`;
  const date = new Date(candidate);
  if (Number.isNaN(date.getTime())) {
    return dateText;
  }

  return dateOnlyFormatter.format(date);
}

function setDefaultDueDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  fields.dueDate.value = tomorrow.toISOString().slice(0, 10);
}

function showScreen(name) {
  Object.values(screens).forEach((screen) => screen.classList.remove("screen-active"));
  screens[name].classList.add("screen-active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setLoginError(message) {
  loginError.textContent = message;
  loginError.hidden = !message;
}

function setFormError(message) {
  formError.textContent = message;
  formError.hidden = !message;
}

async function authenticatedFetch(url, options = {}) {
  const token = getSessionToken();
  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearSessionToken();
    showScreen("login");
    throw new Error("กรุณาเข้าสู่ระบบอีกครั้ง");
  }

  return response;
}

async function login(password) {
  loginButton.disabled = true;
  setLoginError("");

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });
    const result = await response.json();

    if (!response.ok || !result.success || !result.token) {
      throw new Error(result.message || "เข้าสู่ระบบไม่สำเร็จ");
    }

    setSessionToken(result.token);
    managerPasswordInput.value = "";
    showScreen("form");
  } catch (error) {
    setLoginError(error.message || "เข้าสู่ระบบไม่สำเร็จ");
  } finally {
    loginButton.disabled = false;
  }
}

function setTenantLookupStatus(message, isError = false) {
  tenantLookupStatus.textContent = message;
  tenantLookupStatus.classList.toggle("lookup-error", isError);
}

function resetSelect(select, placeholder, disabled = true) {
  select.innerHTML = "";
  select.append(createOption("", placeholder));
  select.disabled = disabled;
}

function populateBuildings() {
  const buildings = [...new Set(roomMaster.map((room) => room.building))].sort();
  resetSelect(fields.building, "เลือกตึก", false);
  buildings.forEach((building) => fields.building.append(createOption(building)));
}

function populateFloors(building) {
  const floors = [
    ...new Set(roomMaster.filter((room) => room.building === building).map((room) => room.floor)),
  ].sort((a, b) => Number(a) - Number(b));

  resetSelect(fields.floor, "เลือกชั้น", !building);
  floors.forEach((floor) => fields.floor.append(createOption(floor, `ชั้น ${floor}`)));
}

function populateRooms(building, floor) {
  const rooms = roomMaster
    .filter((room) => room.building === building && room.floor === floor)
    .map((room) => room.roomId)
    .sort();

  resetSelect(fields.room, "เลือกห้อง", !building || !floor);
  rooms.forEach((roomId) => fields.room.append(createOption(roomId)));
}

function clearTenant() {
  fields.tenantName.value = "";
  fields.tenantLineUserId.value = "";
  fields.tenantPhone.value = "";
  fields.tenantMoveInDate.value = "";
  fields.tenantLeaseId.value = "";
  tenantLookupDetails.hidden = true;
  tenantPhoneDisplay.textContent = "-";
  tenantMoveInDisplay.textContent = "-";
  tenantLeaseDisplay.textContent = "-";
}

function setTenant(data) {
  const name = String(data?.name || "").trim();
  const phone = String(data?.phone || "").trim();
  const moveInDate = String(data?.moveInDate || "").trim();
  const leaseId = String(data?.leaseId || "").trim();

  fields.tenantName.value = name || "-";
  fields.tenantPhone.value = phone;
  fields.tenantMoveInDate.value = moveInDate;
  fields.tenantLeaseId.value = leaseId;
  tenantPhoneDisplay.textContent = phone || "-";
  tenantMoveInDisplay.textContent = formatDateOnly(moveInDate);
  tenantLeaseDisplay.textContent = leaseId || "-";
  tenantLookupDetails.hidden = false;
}

async function requestTenantByRoomId(roomId) {
  const url = new URL("/api/tenant-lookup", window.location.origin);
  url.searchParams.set("roomId", roomId);

  const response = await authenticatedFetch(url.toString(), {
    method: "GET",
    cache: "no-store",
    signal: tenantLookupController?.signal,
  });
  const raw = await response.text();
  const parsed = parseJsonText(raw);

  if (!parsed) {
    throw new Error("ระบบข้อมูลห้องตอบกลับมาไม่ใช่ JSON");
  }
  if (!parsed.ok) {
    throw new Error(parsed.error || "โหลดข้อมูลห้องไม่สำเร็จ");
  }

  return parsed.data || null;
}

async function updateTenantFromRoom() {
  const roomId = fields.room.value;
  clearTenant();

  if (tenantLookupController) {
    tenantLookupController.abort();
  }

  if (!roomId) {
    setTenantLookupStatus("เลือกตึก ชั้น และห้อง เพื่อโหลดข้อมูลลูกบ้าน");
    return;
  }

  tenantLookupController = new AbortController();
  setTenantLookupStatus("กำลังโหลดข้อมูลลูกบ้าน...");
  submitButton.disabled = true;

  try {
    const tenant = await requestTenantByRoomId(roomId);
    if (!tenant) {
      setTenantLookupStatus("ไม่พบข้อมูลลูกบ้านสำหรับห้องนี้", true);
      return;
    }

    setTenant(tenant);
    setTenantLookupStatus("โหลดข้อมูลลูกบ้านสำเร็จ");
  } catch (error) {
    if (error.name === "AbortError") {
      return;
    }
    setTenantLookupStatus(error.message || "โหลดข้อมูลลูกบ้านไม่สำเร็จ", true);
  } finally {
    submitButton.disabled = false;
  }
}

function handleBuildingChange() {
  clearTenant();
  resetSelect(fields.room, "เลือกห้อง", true);
  populateFloors(fields.building.value);
  setTenantLookupStatus(fields.building.value ? "เลือกชั้น" : "เลือกตึก ชั้น และห้อง เพื่อโหลดข้อมูลลูกบ้าน");
}

function handleFloorChange() {
  clearTenant();
  populateRooms(fields.building.value, fields.floor.value);
  setTenantLookupStatus(fields.floor.value ? "เลือกห้องเพื่อโหลดข้อมูลลูกบ้าน" : "เลือกชั้น");
}

function applyBillTypeDefaults() {
  const defaults = BILL_TYPE_DEFAULTS[fields.billType.value];
  if (!defaults) {
    return;
  }

  fields.billTitle.value = defaults.title;
  fields.amountDue.value = defaults.defaultAmount;
}

function getPayload() {
  return {
    room: fields.room.value,
    building: fields.building.value,
    floor: fields.floor.value,
    roomNo: fields.room.value ? fields.room.value.slice(1) : "",
    tenantName: fields.tenantName.value,
    tenantLineUserId: fields.tenantLineUserId.value,
    tenantPhone: fields.tenantPhone.value,
    tenantMoveInDate: fields.tenantMoveInDate.value,
    tenantLeaseId: fields.tenantLeaseId.value,
    billType: fields.billType.value,
    billTitle: fields.billTitle.value.trim(),
    billDescription: fields.billDescription.value.trim(),
    amountDue: Number(fields.amountDue.value),
    dueDate: fields.dueDate.value,
    createdBy: fields.createdBy.value,
    source: "WEBAPP_BILL_CREATE",
  };
}

function validatePayload(payload) {
  const required = [
    ["building", "กรุณาเลือกตึก"],
    ["floor", "กรุณาเลือกชั้น"],
    ["room", "กรุณาเลือกห้อง"],
    ["tenantName", "กรุณารอให้ระบบโหลดข้อมูลลูกบ้านก่อน"],
    ["billType", "กรุณาเลือกประเภทบิล"],
    ["billTitle", "กรุณากรอกชื่อรายการ"],
    ["dueDate", "กรุณาเลือกกำหนดชำระ"],
    ["createdBy", "กรุณาเลือกผู้สร้างบิล"],
  ];

  for (const [key, message] of required) {
    if (!payload[key]) {
      return message;
    }
  }

  if (!Number.isFinite(payload.amountDue) || payload.amountDue <= 0) {
    return "ยอดที่ต้องชำระต้องมากกว่า 0 บาท";
  }

  const defaults = BILL_TYPE_DEFAULTS[payload.billType];
  if (defaults?.requireDescription && !payload.billDescription) {
    return "กรุณากรอกรายละเอียดเพิ่มเติมสำหรับบิลประเภทนี้";
  }

  return "";
}

function formatMoney(amount) {
  return new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: 0,
  }).format(amount);
}

function createDemoBillId() {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replaceAll("-", "");
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `BILL-${datePart}-${randomPart}`;
}

async function submitToWebhook(payload) {
  const response = await authenticatedFetch("/api/create-bill", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("n8n ตอบกลับมาไม่ใช่ JSON");
  }

  if (!response.ok || !result.success) {
    throw new Error(result.message || "ส่งบิลไม่สำเร็จ");
  }

  return result;
}

function showSuccess(result, payload) {
  document.querySelector("#summary-room").textContent = result.room || payload.room;
  document.querySelector("#summary-title").textContent = result.billTitle || payload.billTitle;
  document.querySelector("#summary-amount").textContent = `${formatMoney(result.amountDue || payload.amountDue)} บาท`;
  document.querySelector("#summary-bill-id").textContent = result.billId || "รอ n8n สร้างเลขอ้างอิง";
  showScreen("success");
}

function showError(message) {
  errorDetail.textContent = `Error: ${message}`;
  showScreen("error");
}

async function submitBill(payload = getPayload()) {
  const validationMessage = validatePayload(payload);
  if (validationMessage) {
    setFormError(validationMessage);
    showScreen("form");
    return;
  }

  setFormError("");
  lastPayload = payload;
  submitButton.disabled = true;
  showScreen("loading");

  try {
    const result = await submitToWebhook(payload);
    showSuccess(result, payload);
  } catch (error) {
    showError(error.message);
  } finally {
    submitButton.disabled = false;
  }
}

function resetForm() {
  form.reset();
  resetSelect(fields.floor, "เลือกชั้น", true);
  resetSelect(fields.room, "เลือกห้อง", true);
  clearTenant();
  setDefaultDueDate();
  setFormError("");
  setTenantLookupStatus("เลือกตึก ชั้น และห้อง เพื่อโหลดข้อมูลลูกบ้าน");
}

fields.building.addEventListener("change", handleBuildingChange);
fields.floor.addEventListener("change", handleFloorChange);
fields.room.addEventListener("change", updateTenantFromRoom);
fields.billType.addEventListener("change", applyBillTypeDefaults);

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  login(managerPasswordInput.value);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  submitBill();
});

resetButton.addEventListener("click", resetForm);
editButton.addEventListener("click", () => showScreen("form"));
retryButton.addEventListener("click", () => {
  if (lastPayload) {
    submitBill(lastPayload);
  } else {
    showScreen("form");
  }
});
newBillButton.addEventListener("click", () => {
  resetForm();
  showScreen("form");
});
logoutButton.addEventListener("click", () => {
  clearSessionToken();
  resetForm();
  showScreen("login");
});

populateBuildings();
setDefaultDueDate();

if (getSessionToken()) {
  showScreen("form");
}
