// api.ts
const baseUrl =
  process.env.BASE_URL ||
  "https://reparative-fluxionary-lynwood.ngrok-free.dev/api";

async function getJson(path: string) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const res = await fetch(`${baseUrl}${path}`, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const ct = res.headers.get("content-type") || "";
    if (!ct.toLowerCase().includes("application/json")) {
      const text = await res.text();
      throw new Error(
        `Non-JSON response (${ct}) for ${path}: ${text.substring(0, 120)}`,
      );
    }
    return res.json();
  } catch (error) {
    console.error(`Failed to fetch ${path}:`, error);
    throw error;
  }
}

export async function getTraderStocks(query?: string) {
  const q = query ? `?q=${encodeURIComponent(query)}` : "";
  return getJson(`/trader/stocks${q}`);
}

export async function getTraderReceivables() {
  return getJson("/trader/receivables");
}

// New: Tally API helpers
export async function getCompanyNames() {
  return getJson("/company-names");
}

export async function getCompanyParties(companyName: string) {
  return getJson(`/parties/${encodeURIComponent(companyName)}`);
}

export async function getCompanyStocks(companyName: string) {
  return getJson(`/stocks/${encodeURIComponent(companyName)}`);
}

export async function getStocksWithBatches(companyName: string) {
  return getJson(`/stocks-with-batch/${encodeURIComponent(companyName)}`);
}

export async function getCompanyLedgers(companyName: string) {
  return getJson(`/ledgers/${encodeURIComponent(companyName)}`);
}

export async function createOrder(payload: {
  shopName: string;
  items: { id: string; qty: number }[];
}) {
  const res = await fetch(`${baseUrl}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Order failed");
  return res.json();
}

export async function submitOrderItem(
  companyName: string,
  stockItem: string,
  shopName: string,
  pieces: Record<number, number>,
) {
  const res = await fetch(
    `${baseUrl}/orders/${encodeURIComponent(companyName)}/${encodeURIComponent(stockItem)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        shopName,
        pieces,
      }),
    },
  );
  if (!res.ok) throw new Error("Failed to submit order item");
  return res.json();
}

export async function submitOrder(
  companyName: string,
  shopName: string,
  items: Array<{ name: string; pieces: Record<number, number> }>,
) {
  const orderItems = items.map((item) => ({
    stockItem: item.name,
    pieces: item.pieces,
  }));

  const res = await fetch(
    `${baseUrl}/orders/${encodeURIComponent(companyName)}/${encodeURIComponent(shopName)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(orderItems),
    },
  );
  if (!res.ok) throw new Error("Failed to submit order");
  return res.json();
}

// New: Punch In API - sends email to orders.cochintraders@outlook.com
export async function submitPunchIn(payload: {
  employeeName: string;
  employeePhone: string;
  companyName: string;
  shopName: string;
  amount: number;
  location: { lat: number; lng: number };
  time: string;
  date: string;
}) {
  const res = await fetch(`${baseUrl}/punch-in`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Punch in failed");
  return res.json();
}

export async function postTraderActivity(payload: {
  type: string;
  shopName: string;
  amount: number;
  location?: string | { lat: number; lng: number } | undefined;
  empId?: string;
  employeeName?: string;
  place?: string;
  date?: string;
  time?: string;
  companyName?: string;
}) {
  const res = await fetch(`${baseUrl}/trader/activity`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(payload.employeeName
        ? { "x-employee-name": payload.employeeName }
        : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Activity post failed");
  return res.json();
}

export async function sendCollection(payload: {
  shopName: string;
  amount: number;
  empId?: string;
  location?: { lat: number; lng: number };
  employeeName?: string;
  companyName?: string;
}) {
  const res = await fetch(`${baseUrl}/send-collection`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(payload.employeeName
        ? { "x-employee-name": payload.employeeName }
        : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Send collection failed");
  return res.json();
}

export async function employeeSignIn(phone: string, pin?: string) {
  const res = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ phone, pin }),
  });
  if (!res.ok) throw new Error("Sign-in failed");
  return res.json();
}

export async function createEmployeePublic(name: string, phone: string) {
  const res = await fetch(`${baseUrl}/employees`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, phone }),
  });
  if (!res.ok) throw new Error("Create employee failed");
  return res.json();
}

export async function addBatches(payload: {
  companyName: string;
  stockItem: string;
  batches: { size: number; quantity: number }[];
}) {
  const res = await fetch(`${baseUrl}/add-batches`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Add batches failed");
  return res.json();
}

export async function getBatches(companyName: string, stockItem: string) {
  return getJson(
    `/batches/${encodeURIComponent(companyName)}/${encodeURIComponent(stockItem)}`,
  );
}

export async function getStockBatches(companyName: string) {
  return getJson(`/get-batches/${encodeURIComponent(companyName)}`);
}
