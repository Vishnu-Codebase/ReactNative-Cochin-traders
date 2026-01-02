const baseUrl = process.env.BASE_URL || 'http://localhost:3000/api';
 
const ADMIN_PIN = process.env.ADMIN_PIN || '3133';

async function getJson(path: string) {
  const headers: Record<string, string> = { 'admin_pin': ADMIN_PIN };
  const res = await fetch(`${baseUrl}${path}`, { headers });
  if (!res.ok) throw new Error('Network error');
  return res.json();
}

export async function getTraderStocks(query?: string) {
  const q = query ? `?q=${encodeURIComponent(query)}` : '';
  return getJson(`/trader/stocks${q}`);
}

export async function getTraderReceivables() {
  return getJson('/trader/receivables');
}

// New: Tally API helpers
export async function getCompanyNames() {
  return getJson('/company-names');
}

export async function getCompanyParties(companyName: string) {
  return getJson(`/parties/${encodeURIComponent(companyName)}`);
}

export async function getCompanyStocks(companyName: string) {
  return getJson(`/stocks/${encodeURIComponent(companyName)}`);
}

export async function createOrder(payload: { shopName: string; items: { id: string; qty: number }[] }) {
  const res = await fetch(`${baseUrl}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'admin_pin': ADMIN_PIN,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Order failed');
  return res.json();
}

export async function postTraderActivity(payload: { type: string; shopName: string; amount: number; location?: { lat: number; lng: number } | undefined; empId?: string; employeeName?: string; place?: string; date?: string; time?: string; companyName?: string }) {
  const res = await fetch(`${baseUrl}/trader/activity`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'admin_pin': ADMIN_PIN,
      ...(payload.employeeName ? { 'x-employee-name': payload.employeeName } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Activity post failed');
  return res.json();
}

export async function sendCollection(payload: { shopName: string; amount: number; empId?: string; location?: { lat: number; lng: number }; employeeName?: string; companyName?: string }) {
  const res = await fetch(`${baseUrl}/send-collection`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'admin_pin': ADMIN_PIN,
      ...(payload.employeeName ? { 'x-employee-name': payload.employeeName } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Send collection failed');
  return res.json();
}

export async function employeeSignIn(phone: string, pin?: string) {
  const res = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'admin_pin': ADMIN_PIN,
    },
    body: JSON.stringify({ phone, pin }),
  });
  if (!res.ok) throw new Error('Sign-in failed');
  return res.json();
}

export async function createEmployeePublic(name: string, phone: string) {
  const res = await fetch(`${baseUrl}/employees`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'admin_pin': ADMIN_PIN,
    },
    body: JSON.stringify({ name, phone }),
  });
  if (!res.ok) throw new Error('Create employee failed');
  return res.json();
}
