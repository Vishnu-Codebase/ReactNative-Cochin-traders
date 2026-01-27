// lib/api.ts
import { initializeApp } from 'firebase/app';
 
import {
  getDatabase,
  get as rGet,
  ref as rRef,
  set as rSet,
  update as rUpdate
} from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBoczn7m12JtESfIn7cIpbCXOJvUJPFeGM",
  authDomain: "cochin-traders-9e54c.firebaseapp.com",
  databaseURL: "https://cochin-traders-9e54c-default-rtdb.firebaseio.com",
  projectId: "cochin-traders-9e54c",
  storageBucket: "cochin-traders-9e54c.firebasestorage.app",
  messagingSenderId: "772434920284",
  appId: "1:772434920284:web:52e8369814dab16d093799",
  measurementId: "G-08J2Q7V1XT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const rtdb = getDatabase(app);

// Helper function to sanitize company names for document IDs
function sanitizeDocId(companyName: string): string {
  return String(companyName)
    .trim()
    .replace(/[\/\\.#$\[\]]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Resolve RTDB company key from a display name or id
async function resolveRTDBCompanyKey(name: string) {
  try {
    const rootSnap = await rGet(rRef(rtdb, 'companiesData'));
    const obj = rootSnap.val() || {};
    if (obj[name]) return name;
    const slug = String(name).toLowerCase().trim().replace(/\s+/g, '-');
    if (obj[slug]) return slug;
    const found = Object.keys(obj).find((k) => {
      const display = String(obj[k]?.companyDetails?.companyName || '').toLowerCase().trim();
      return display === String(name).toLowerCase().trim();
    });
    return found || name;
  } catch {
    return name;
  }
}

// ============================================
// READ OPERATIONS
// ============================================

// Get all company names
export async function getCompanyNames() {
  try {
    const snap = await rGet(rRef(rtdb, 'companiesData'));
    const obj = snap.val() || {};
    const companies = Object.keys(obj).map((key) => {
      const v = obj[key] || {};
      const displayName = v?.companyDetails?.companyName || key;
      const ts = v?.lastSyncedAt ?? v?.counts?.lastSyncedAt;
      const lastSyncedAt =
        typeof ts === 'string'
          ? ts
          : typeof ts === 'number'
          ? new Date(ts).toISOString()
          : null;
      return { companyName: String(displayName), lastSyncedAt };
    });
    companies.sort((a, b) => (a.companyName || '').localeCompare(b.companyName || ''));
    return { success: true, count: companies.length, data: companies };
  } catch (error) {
    console.error('Error fetching company names:', error);
    throw error;
  }
}

// Get specific company data
export async function getCompany(companyName: string) {
  try {
    const key = await resolveRTDBCompanyKey(companyName);
    const snap = await rGet(rRef(rtdb, `companiesData/${key}/companyDetails`));
    if (!snap.exists()) {
      throw new Error('Company not found');
    }
    return { success: true, data: snap.val() };
  } catch (error) {
    console.error('Error fetching company:', error);
    throw error;
  }
}

// Get company ledgers
export async function getCompanyLedgers(companyName: string) {
  try {
    const key = await resolveRTDBCompanyKey(companyName);
    const snap = await rGet(rRef(rtdb, `companiesData/${key}/ledgers`));
    const val = snap.val();
    const ledgers =
      Array.isArray(val) ? val : val && typeof val === 'object' ? Object.values(val) : [];
    return { success: true, count: ledgers.length, data: ledgers };
  } catch (error) {
    console.error('Error fetching ledgers:', error);
    throw error;
  }
}

// Get company stocks
export async function getCompanyStocks(companyName: string) {
  try {
    const key = await resolveRTDBCompanyKey(companyName);
    const snap = await rGet(rRef(rtdb, `companiesData/${key}/stocks`));
    const val = snap.val();
    const stocks =
      Array.isArray(val)
        ? val
        : val && typeof val === 'object'
        ? Object.entries(val)
            .filter(([k]) => !String(k).startsWith('_'))
            .map(([, v]) => v)
        : [];
    return { success: true, count: stocks.length, data: stocks };
  } catch (error) {
    console.error('Error fetching stocks:', error);
    throw error;
  }
}

// Get company parties
export async function getCompanyParties(companyName: string) {
  try {
    const key = await resolveRTDBCompanyKey(companyName);
    const snap = await rGet(rRef(rtdb, `companiesData/${key}/parties`));
    const val = snap.val();
    const parties =
      Array.isArray(val) ? val : val && typeof val === 'object' ? Object.values(val) : [];
    return { success: true, count: parties.length, data: parties };
  } catch (error) {
    console.error('Error fetching parties:', error);
    throw error;
  }
}

// Get stocks with batches
export async function getStocksWithBatches(companyName: string) {
  try {
    const companyKey = await resolveRTDBCompanyKey(companyName);
    const stocksSnap = await rGet(rRef(rtdb, `companiesData/${companyKey}/stocks`));
    const stocksVal = stocksSnap.val();
    const stocks =
      Array.isArray(stocksVal)
        ? stocksVal
        : stocksVal && typeof stocksVal === 'object'
        ? Object.entries(stocksVal)
            .filter(([k]) => !String(k).startsWith('_'))
            .map(([, v]) => v)
        : [];

    const batchesSnap = await rGet(rRef(rtdb, `stockBatchesByCompany/${companyKey}`));
    const batchesObj = batchesSnap.val() || {};
    const batchDocs: any[] = Array.isArray(batchesObj) ? batchesObj : Object.values(batchesObj);
    const batchMap: Record<string, { batches: Array<{ size: number; quantity: number }>; totalQuantity: number }> = {};
    for (const b of batchDocs) {
      const nameKey = sanitizeDocId(b?.stockItem || '');
      batchMap[nameKey] = {
        batches:
          Array.isArray(b?.batches)
            ? b.batches
            : b?.batches && typeof b.batches === 'object'
            ? Object.values(b.batches)
            : [],
        totalQuantity: Number(b?.totalQuantity || 0) || 0,
      };
    }

    const data = stocks.map((s: any) => {
      const name = s.$Name || s.Name || s.StockName || '';
      const nameKey = sanitizeDocId(name);
      const info =
        batchMap[nameKey] || {
          batches: [],
          totalQuantity: 0,
        };
      const closingBalance = Number(s.$ClosingBalance ?? s.ClosingBalance ?? 0) || 0;
      return { ...s, batches: info.batches, totalQuantity: info.totalQuantity, closingBalance };
    });

    return { success: true, count: data.length, data };
  } catch (error) {
    console.error('Error fetching stocks with batches:', error);
    throw error;
  }
}

// Get batches for a specific stock item
export async function getBatches(companyName: string, stockItem: string) {
  try {
    const companyKey = await resolveRTDBCompanyKey(companyName);
    const itemKey = sanitizeDocId(stockItem);
    const snap = await rGet(rRef(rtdb, `stockBatchesByCompany/${companyKey}/${itemKey}`));
    const v = snap.val() || {};
    const batches =
      Array.isArray(v?.batches)
        ? v.batches
        : v?.batches && typeof v.batches === 'object'
        ? Object.values(v.batches)
        : [];
    const found = !!snap.exists() && batches.length > 0;
    return {
      success: true,
      found,
      companyName: v.companyName || companyName,
      stockItem: v.stockItem || stockItem,
      batches,
      totalQuantity: v.totalQuantity || 0,
      batchCount: batches.length,
      createdAt: v.createdAt || null,
      updatedAt: v.updatedAt || null,
    };
  } catch (error) {
    console.error('Error fetching batches:', error);
    throw error;
  }
}

// ============================================
// WRITE OPERATIONS
// ============================================

// Add batches
export async function addBatches(payload: {
  companyName: string;
  stockItem: string;
  batches: Array<{ size: number; quantity: number }>;
}) {
  try {
    const { companyName, stockItem, batches } = payload;

    if (!companyName || !stockItem || !batches || batches.length === 0) {
      throw new Error('Invalid payload');
    }

    const validBatches = batches.filter(
      (b) => typeof b.size === 'number' && b.size > 0 && typeof b.quantity === 'number' && b.quantity > 0
    );

    if (validBatches.length === 0) {
      throw new Error('No valid batches found');
    }

    const totalQuantity = validBatches.reduce((sum, b) => sum + b.quantity, 0);

    const document = {
      companyName,
      stockItem,
      batches: validBatches,
      totalQuantity,
      updatedAt: new Date().toISOString(),
    };

    const companyKey = await resolveRTDBCompanyKey(companyName);
    const itemKey = sanitizeDocId(stockItem);
    const byCompanyRef = rRef(rtdb, `stockBatchesByCompany/${companyKey}/${itemKey}`);
    const existingSnap = await rGet(byCompanyRef);
    if (!existingSnap.exists()) {
      await rSet(byCompanyRef, { ...document, createdAt: new Date().toISOString() });
    } else {
      await rUpdate(byCompanyRef, document);
    }

    console.log(`✓ Batches saved for ${companyName} - ${stockItem}`);

    return {
      success: true,
      message: `Batches for ${stockItem} saved successfully`,
      companyName,
      stockItem,
      batchCount: validBatches.length,
      totalQuantity,
    };
  } catch (error) {
    console.error('Error adding batches:', error);
    throw error;
  }
}

// Submit order
export async function submitOrder(
  companyName: string,
  shopName: string,
  items: Array<{ stockItem: string; pieces: Record<number, number> }>
) {
  try {
    if (!companyName || !shopName || !items || items.length === 0) {
      throw new Error('Invalid order data');
    }

    console.log('Processing order:', { companyName, shopName, itemsCount: items.length });

    for (const item of items) {
      const { stockItem, pieces } = item;

      if (!stockItem || !pieces) {
        console.warn('Skipping invalid item:', item);
        continue;
      }

      const companyKey = await resolveRTDBCompanyKey(companyName);
      const itemKey = sanitizeDocId(stockItem);
      const byCompanyRef = rRef(rtdb, `stockBatchesByCompany/${companyKey}/${itemKey}`);
      const snap = await rGet(byCompanyRef);
      const batchData = snap.val() || {};
      const currentBatches = Array.isArray(batchData.batches)
        ? batchData.batches
        : batchData.batches && typeof batchData.batches === 'object'
        ? Object.values(batchData.batches)
        : [];

      let totalReduced = 0;
      const updatedBatches = currentBatches.map((batch: any) => {
        const batchSize = batch.size;
        const requestedQty = pieces[batchSize] || 0;

        if (requestedQty > 0) {
          const newQuantity = Math.max(0, batch.quantity - requestedQty);
          totalReduced += batch.quantity - newQuantity;
          return { ...batch, quantity: newQuantity };
        }

        return batch;
      });

      const newTotalQuantity = updatedBatches.reduce(
        (sum: number, b: any) => sum + (Number(b.quantity) || 0),
        0
      );
      await rUpdate(byCompanyRef, {
        batches: updatedBatches,
        totalQuantity: newTotalQuantity,
        updatedAt: new Date().toISOString(),
        companyName,
        stockItem,
      });

      console.log(`✓ Updated batches for ${stockItem}, reduced by ${totalReduced}`);
    }

    try {
      const url = `https://cochin-express.vercel.app/api/send-order`;
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': '2a54ff0c0b16c5eccf1f88c633119f3c37c3b9a697c89e875a48b435400bb755',
        },
        body: JSON.stringify({ companyName, shopName, items }),
      });
    } catch (err) {
      console.error('Error sending order email:', err);
    }

    return {
      success: true,
      message: `Order placed successfully for ${shopName}`,
      companyName,
      shopName,
      itemsCount: items.length,
    };
  } catch (error) {
    console.error('Error submitting order:', error);
    throw error;
  }
}

// Submit punch in
export async function submitPunchIn(payload: {
  employeeName: string;
  employeePhone: string;
  companyName: string;
  shopName: string;
  amount: number;
  time: string;
  date: string;
}) {
  try {
    const url = `https://cochin-express.vercel.app/api/punch-in`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': '2a54ff0c0b16c5eccf1f88c633119f3c37c3b9a697c89e875a48b435400bb755',
      },
      body: JSON.stringify(payload),
    });
    const data = await resp.json();
    if (!resp.ok) {
      const msg = data?.error || data?.message || 'Failed to submit punch in';
      throw new Error(msg);
    }
    console.log('✓ Punch in submitted:', data);
    return data || { success: true, message: 'Punch in recorded successfully' };
  } catch (error) {
    console.error('Error submitting punch in:', error);
    throw error;
  }
}
