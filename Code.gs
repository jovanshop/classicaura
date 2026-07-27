/**
 * Classic Aura — Admin Orders API (Google Apps Script)
 *
 * Deploy as a Web App → Execute as "Me" → Who has access "Anyone"
 *
 * SETUP:
 * 1. Open the Google Sheet where your orders are stored
 * 2. Copy the Sheet ID from the URL (the long string between /d/ and /edit)
 * 3. Paste it into SHEET_ID below
 * 4. Change ADMIN_PASSWORD to a strong password of your choice
 * 5. If your sheet doesn't have a "Status" column yet,
 *    run initializeSheet_() once from the Apps Script editor
 * 6. Deploy → New deployment → Web app → Execute as "Me" → Anyone
 * 7. Copy the Web App URL and paste it into admin.html as SCRIPT_URL
 */

// ═══ CONFIGURATION — EDIT THESE ═══
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE';
const ADMIN_PASSWORD = 'admin123';  // ← CHANGE THIS to a strong password
// ═══════════════════════════════════

// Column order expected in the sheet (1-indexed, auto-detected from header)
const COLUMNS = [
  'Timestamp', 'Order ID', 'Name', 'Phone', 'Address',
  'City/District', 'Payment Method', 'Items', 'Total', 'Status'
];

/**
 * Handle GET requests — return all orders (requires ?password= in query)
 */
function doGet(e) {
  return handleCorsRequest_(e);
}

/**
 * Handle POST requests — auth, get orders, or update status
 */
function doPost(e) {
  return handleCorsRequest_(e);
}

/**
 * Central request handler
 */
function handleCorsRequest_(e) {
  // Handle CORS preflight
  if (e && e.method === 'OPTIONS') {
    return sendJson_({ success: true });
  }

  try {
    // ── Parse the request ──
    let password, action, data;

    if (e && e.parameter) {
      // GET request or query params
      password = e.parameter.password;
      action = e.parameter.action || 'getOrders';
    }

    if (e && e.postData && e.postData.contents) {
      // POST request
      try {
        data = JSON.parse(e.postData.contents);
        password = data.password || password;
        action = data.action || action;
      } catch (parseErr) {
        return sendJson_({ error: 'Invalid JSON body' }, 400);
      }
    }

    // ── Require password for all actions ──
    if (!password || password !== ADMIN_PASSWORD) {
      return sendJson_({ error: 'Unauthorized — invalid password' }, 401);
    }

    // ── Route actions ──
    switch (action) {
      case 'getOrders':
        return handleGetOrders_();
      case 'updateStatus':
        return handleUpdateStatus_(data);
      case 'addOrder':
        return handleAddOrder_(data);
      default:
        return sendJson_({ error: 'Unknown action: ' + action }, 400);
    }

  } catch (err) {
    return sendJson_({ error: 'Server error: ' + err.message }, 500);
  }
}

/**
 * Return all orders from the sheet
 */
function handleGetOrders_() {
  const sheet = getSheet_();
  const allData = sheet.getDataRange().getValues();

  if (allData.length < 2) {
    return sendJson_({ orders: [], summary: emptySummary_() });
  }

  const headers = allData[0].map(h => String(h).trim());
  const rows = allData.slice(1);

  const orders = rows.map((row, index) => {
    const obj = { rowIndex: index + 2 }; // 1-indexed + header row
    headers.forEach((h, i) => {
      obj[normalizeKey_(h)] = row[i] !== undefined ? String(row[i]).trim() : '';
    });
    return obj;
  });

  // Build summary
  const summary = buildSummary_(orders);

  return sendJson_({ orders, summary });
}

/**
 * Update the status of a specific order
 */
function handleUpdateStatus_(data) {
  if (!data.orderId || !data.status) {
    return sendJson_({ error: 'Missing orderId or status' }, 400);
  }

  const sheet = getSheet_();
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0].map(h => String(h).trim());
  const orderIdCol = findColumnIndex_(headers, 'Order ID');
  const statusCol = findColumnIndex_(headers, 'Status');

  if (orderIdCol === -1) {
    return sendJson_({ error: 'Order ID column not found in sheet' }, 500);
  }
  if (statusCol === -1) {
    return sendJson_({ error: 'Status column not found. Run initializeSheet_() first.' }, 500);
  }

  // Search for the order
  for (let i = 1; i < allData.length; i++) {
    const cellValue = String(allData[i][orderIdCol]).trim();
    if (cellValue === String(data.orderId).trim()) {
      sheet.getRange(i + 1, statusCol + 1).setValue(data.status);
      return sendJson_({ success: true, orderId: data.orderId, status: data.status });
    }
  }

  return sendJson_({ error: 'Order not found: ' + data.orderId }, 404);
}

/**
 * Add a new order (same format as the existing checkout submission)
 */
function handleAddOrder_(data) {
  if (!data.orderId) {
    return sendJson_({ error: 'Missing orderId' }, 400);
  }

  const sheet = getSheet_();
  const headers = sheet.getDataRange().getValues()[0].map(h => String(h).trim());
  const statusCol = findColumnIndex_(headers, 'Status');
  const hasStatusCol = statusCol !== -1;

  const now = new Date();
  const timestamp = Utilities.formatDate(now, 'Asia/Dhaka', 'yyyy-MM-dd HH:mm:ss');

  const row = [
    timestamp,
    data.orderId || '',
    data.name || '',
    data.phone || '',
    data.address || '',
    data.city || '',
    data.paymentMethod || '',
    data.items || '',
    data.total || '',
  ];

  // Add empty Status cell if column exists
  if (hasStatusCol) {
    row.push('Pending');
  }

  sheet.appendRow(row);

  return sendJson_({ success: true, orderId: data.orderId });
}

/**
 * Run this once from the editor to add a Status column if missing
 */
function initializeSheet_() {
  const sheet = getSheet_();
  const headers = sheet.getDataRange().getValues()[0].map(h => String(h).trim());

  if (!headers.includes('Status')) {
    const lastCol = headers.length;
    sheet.getRange(1, lastCol + 1).setValue('Status');
    // Set all existing rows to 'Pending'
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, lastCol + 1, lastRow - 1, 1).setValue('Pending');
    }
    return 'Status column added and initialized to "Pending".';
  }

  return 'Status column already exists.';
}

// ════════════════════════════════════════════
//  HELPERS
// ════════════════════════════════════════════

function getSheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  return ss.getActiveSheet(); // or ss.getSheetByName('Sheet1') if needed
}

function findColumnIndex_(headers, name) {
  const key = normalizeKey_(name);
  for (let i = 0; i < headers.length; i++) {
    if (normalizeKey_(headers[i]) === key) return i;
  }
  return -1;
}

function normalizeKey_(str) {
  return String(str).replace(/[^a-z0-9]/gi, '').toLowerCase();
}

function emptySummary_() {
  return {
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
  };
}

function buildSummary_(orders) {
  const summary = emptySummary_();
  summary.totalOrders = orders.length;

  orders.forEach(o => {
    const status = (o.status || '').toLowerCase();
    if (status === 'pending') summary.pendingOrders++;
    else if (status === 'processing') summary.processingOrders++;
    else if (status === 'shipped') summary.shippedOrders++;
    else if (status === 'delivered') summary.deliveredOrders++;
    else if (status === 'cancelled') summary.cancelledOrders++;

    const total = parseFloat(o.total) || 0;
    summary.totalRevenue += total;
  });

  // Recent 5 orders sorted by row index (newest = highest row index)
  const recent = orders.slice(-5).reverse();
  summary.recentOrders = recent.map(o => ({
    orderId: o.orderId || '',
    name: o.name || '',
    total: o.total || '',
    status: o.status || 'Pending',
  }));

  return summary;
}

function sendJson_(obj, statusCode = 200) {
  const output = ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);

  // For POST with CORS
  if (statusCode !== 200) {
    const errorPayload = JSON.stringify(obj);
    return ContentService.createTextOutput(errorPayload)
      .setMimeType(ContentService.MimeType.JSON);
  }

  return output;
}
