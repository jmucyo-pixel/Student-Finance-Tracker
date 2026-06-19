// storage.js - handles localStorage persistence

const DATA_KEY = 'finance-tracker:data';
const SETTINGS_KEY = 'finance-tracker:settings';

const DEFAULT_SETTINGS = {
  rates: { USD: 1, EUR: 0.92, RWF: 1400 },
  displayCurrency: 'USD',
  cap: 1000,
  theme: 'light'
};

// Load all transaction records from localStorage and returns an empty array if nothing is stored or data is corrupt.
 
export function loadRecords() {
  try {
    const raw = localStorage.getItem(DATA_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (err) {
    console.error('Failed to load records:', err);
    return [];
  }
}

// Save the full records array to localStorage.
export function saveRecords(records) {
  try {
    localStorage.setItem(DATA_KEY, JSON.stringify(records));
    return true;
  } catch (err) {
    console.error('Failed to save records:', err);
    return false;
  }
}

// Load settings from localStorage.
 
export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed, rates: { ...DEFAULT_SETTINGS.rates, ...(parsed.rates || {}) } };
  } catch (err) {
    console.error('Failed to load settings:', err);
    return { ...DEFAULT_SETTINGS };
  }
}

// Save settings to localStorage.

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (err) {
    console.error('Failed to save settings:', err);
    return false;
  }
}

// make sure each record has an: id, description, amount, category, date.
 
export function validateImportedRecords(data) {
  if (!Array.isArray(data)) {
    return { valid: false, error: 'Imported data must be a JSON array of records.' };
  }
  for (let i = 0; i < data.length; i++) {
    const r = data[i];
    if (typeof r !== 'object' || r === null) {
      return { valid: false, error: `Record at index ${i} is not an object.` };
    }
    if (typeof r.id !== 'string' || !r.id) {
      return { valid: false, error: `Record at index ${i} is missing a valid "id".` };
    }
    if (typeof r.description !== 'string' || !r.description.trim()) {
      return { valid: false, error: `Record at index ${i} is missing a valid "description".` };
    }
    if (typeof r.amount !== 'number' || isNaN(r.amount) || r.amount < 0) {
      return { valid: false, error: `Record at index ${i} has an invalid "amount".` };
    }
    if (typeof r.category !== 'string' || !r.category.trim()) {
      return { valid: false, error: `Record at index ${i} is missing a valid "category".` };
    }
    if (typeof r.date !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(r.date)) {
      return { valid: false, error: `Record at index ${i} has an invalid "date" (expected YYYY-MM-DD).` };
    }
  }
  return { valid: true, error: null };
}
