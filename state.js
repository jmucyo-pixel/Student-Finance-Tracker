// state.js - central application state and record operations

import { loadRecords, saveRecords, loadSettings, saveSettings } from './storage.js';

let records = loadRecords();
let settings = loadSettings();

// Apply persisted theme on load
if (settings.theme === 'dark') {
  document.documentElement.setAttribute('data-theme', 'dark');
}

// Get a shallow copy of all records. 
export function getRecords() {
  return [...records];
}

// Get current settings object. 
export function getSettings() {
  return { ...settings, rates: { ...settings.rates } };
}

// Generate a new unique id like "txn_0007". 
function generateId() {
  const max = records.reduce((acc, r) => {
    const match = /^txn_(\d+)$/.exec(r.id);
    if (match) {
      const num = parseInt(match[1], 10);
      return num > acc ? num : acc;
    }
    return acc;
  }, 0);
  return `txn_${String(max + 1).padStart(4, '0')}`;
}

/**
 * Add a new record.
 * Returns the created record.
 */
export function addRecord({ description, amount, category, date }) {
  const now = new Date().toISOString();
  const record = {
    id: generateId(),
    description: description.trim(),
    amount: parseFloat(amount),
    category: category.trim(),
    date,
    createdAt: now,
    updatedAt: now
  };
  records.push(record);
  persist();
  return record;
}

//  Update an existing record by id. Returns the updated record or null.
 
export function updateRecord(id, { description, amount, category, date }) {
  const idx = records.findIndex(r => r.id === id);
  if (idx === -1) return null;
  records[idx] = {
    ...records[idx],
    description: description.trim(),
    amount: parseFloat(amount),
    category: category.trim(),
    date,
    updatedAt: new Date().toISOString()
  };
  persist();
  return records[idx];
}

// Delete a record by id. Returns true if deleted.
export function deleteRecord(id) {
  const before = records.length;
  records = records.filter(r => r.id !== id);
  persist();
  return records.length < before;
}

// Find a single record by id.
export function findRecord(id) {
  return records.find(r => r.id === id) || null;
}

// Replace all records (used for import). 
export function replaceAllRecords(newRecords) {
  records = newRecords.map(r => ({
    ...r,
    createdAt: r.createdAt || new Date().toISOString(),
    updatedAt: r.updatedAt || new Date().toISOString()
  }));
  persist();
}

// Update settings (rates, displayCurrency, cap, theme) and persist. 
export function updateSettings(partial) {
  settings = { ...settings, ...partial, rates: { ...settings.rates, ...(partial.rates || {}) } };
  saveSettings(settings);
  return getSettings();
}

function persist() {
  saveRecords(records);
}

/* ===== Derived data / stats ===== */

// Sum of all record amounts (in base currency, USD). 
export function getTotalSum() {
  return records.reduce((sum, r) => sum + r.amount, 0);
}

/** Total number of records. */
export function getTotalCount() {
  return records.length;
}

// Most frequently used category (by count). Returns category name or '-'. 
export function getTopCategory() {
  if (records.length === 0) return '-';
  const counts = {};
  for (const r of records) {
    counts[r.category] = (counts[r.category] || 0) + 1;
  }
  let top = '-';
  let max = 0;
  for (const [cat, count] of Object.entries(counts)) {
    if (count > max) {
      max = count;
      top = cat;
    }
  }
  return top;
}

/**
 * Returns an array of 7 entries { label, total } for the last 7 days
 * (including today), ordered oldest -> newest.
 */
export function getLast7DaysTrend() {
  const days = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString(undefined, { weekday: 'short' });
    const total = records
      .filter(r => r.date === iso)
      .reduce((sum, r) => sum + r.amount, 0);
    days.push({ label, total, date: iso });
  }
  return days;
}

// Sum of amounts within the last 7 days. 
export function getLast7DaysSum() {
  return getLast7DaysTrend().reduce((sum, d) => sum + d.total, 0);
}

// Convert a base-currency (USD) amount into the display currency. 
export function convertCurrency(amountUSD, targetCurrency) {
  const rate = settings.rates[targetCurrency] ?? 1;
  return amountUSD * rate;
}

// Currency symbol/code helper for display. 
export function currencyLabel(amount, currency) {
  const symbols = { USD: '$', EUR: '\u20AC', RWF: 'RWF ' };
  const symbol = symbols[currency] || '';
  return `${symbol}${amount.toFixed(2)}`;
}
