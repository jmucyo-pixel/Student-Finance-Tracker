// app.js - main application entry point

import {
  getRecords, addRecord, updateRecord, deleteRecord, findRecord,
  replaceAllRecords, getSettings, updateSettings,
  getTotalSum, getTotalCount, getTopCategory, getLast7DaysTrend, getLast7DaysSum
} from '../state.js';

import {
  validateDescription, validateAmount, validateDate, validateCategory
} from './validators.js';

import { searchRecords, sortRecords } from '../search.js';

import {
  renderRecords, renderStats, renderTrendChart, renderCapStatus,
  setFieldError, setFormStatus, setSearchStatus, setSettingsStatus
} from './ui.js';

import { validateImportedRecords } from '../storage.js';

// Element references 
const form = document.getElementById('record-form');
const idField = document.getElementById('record-id');
const descField = document.getElementById('description');
const amountField = document.getElementById('amount');
const categoryField = document.getElementById('category');
const dateField = document.getElementById('date');
const submitBtn = document.getElementById('submit-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

const searchInput = document.getElementById('search-input');
const caseInsensitiveCheckbox = document.getElementById('case-insensitive');
const sortSelect = document.getElementById('sort-select');

const capInput = document.getElementById('cap-input');

const rateEurInput = document.getElementById('rate-eur');
const rateRwfInput = document.getElementById('rate-rwf');
const displayCurrencySelect = document.getElementById('display-currency');
const saveSettingsBtn = document.getElementById('save-settings-btn');

const exportBtn = document.getElementById('export-btn');
const exportCsvBtn = document.getElementById('export-csv-btn');
const importFile = document.getElementById('import-file');
const themeToggleBtn = document.getElementById('theme-toggle-btn');

// Initialization
function init() {
  const settings = getSettings();
  capInput.value = settings.cap;
  rateEurInput.value = settings.rates.EUR;
  rateRwfInput.value = settings.rates.RWF;
  displayCurrencySelect.value = settings.displayCurrency;

  refreshAll();
  attachEventListeners();
}

// Render orchestration
function refreshAll() {
  refreshDashboard();
  refreshRecordsList();
}

function refreshDashboard() {
  const settings = getSettings();
  const sum = getTotalSum();

  renderStats({
    total: getTotalCount(),
    sum,
    topCategory: getTopCategory(),
    last7Sum: getLast7DaysSum(),
    settings
  });

  renderTrendChart(getLast7DaysTrend(), settings);
  renderCapStatus(sum, settings.cap, settings);
}

function refreshRecordsList() {
  const settings = getSettings();
  const pattern = searchInput.value.trim();
  const caseInsensitive = caseInsensitiveCheckbox.checked;

  const { results, regex, error } = searchRecords(getRecords(), pattern, caseInsensitive);

  if (error) {
    setSearchStatus('Invalid regular expression. Showing no results.');
  } else if (pattern) {
    setSearchStatus(`${results.length} record${results.length === 1 ? '' : 's'} match your search.`);
  } else {
    setSearchStatus('');
  }

  const sorted = sortRecords(results, sortSelect.value);

  renderRecords(sorted, regex, settings, {
    onEdit: handleEditRecord,
    onDelete: handleDeleteRecord
  });
}

// Form handling
function handleFormSubmit(e) {
  e.preventDefault();

  const description = descField.value;
  const amount = amountField.value.trim();
  const category = categoryField.value;
  const date = dateField.value.trim();

  const errors = {
    description: validateDescription(description.trim()),
    amount: validateAmount(amount),
    category: validateCategory(category.trim()),
    date: validateDate(date)
  };

  setFieldError('description', errors.description);
  setFieldError('amount', errors.amount);
  setFieldError('category', errors.category);
  setFieldError('date', errors.date);

  const hasErrors = Object.values(errors).some(msg => msg !== '');
  if (hasErrors) {
    setFormStatus('Please fix the errors above before submitting.', 'error');
    return;
  }

  const editingId = idField.value;
  const payload = {
    description: description.trim(),
    amount,
    category: category.trim(),
    date
  };

  if (editingId) {
    updateRecord(editingId, payload);
    setFormStatus('Transaction updated successfully.', 'success');
    exitEditMode();
  } else {
    addRecord(payload);
    setFormStatus('Transaction added successfully.', 'success');
    form.reset();
  }

  refreshAll();
}

function handleEditRecord(id) {
  const record = findRecord(id);
  if (!record) return;

  idField.value = record.id;
  descField.value = record.description;
  amountField.value = record.amount.toFixed(2);
  categoryField.value = record.category;
  dateField.value = record.date;

  submitBtn.textContent = 'Save Changes';
  cancelEditBtn.hidden = false;
  setFormStatus(`Editing "${record.description}".`, '');

  // Move focus to the form for keyboard users
  document.getElementById('form-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
  descField.focus();
}

function exitEditMode() {
  idField.value = '';
  form.reset();
  submitBtn.textContent = 'Add Transaction';
  cancelEditBtn.hidden = true;
}

function handleCancelEdit() {
  exitEditMode();
  setFormStatus('Edit cancelled.', '');
}

function handleDeleteRecord(id) {
  const record = findRecord(id);
  if (!record) return;

  const confirmed = window.confirm(`Delete "${record.description}"? This cannot be undone.`);
  if (!confirmed) return;

  deleteRecord(id);
  setFormStatus(`Deleted "${record.description}".`, 'success');
  refreshAll();
}

// Live regex validation feedback
function attachLiveValidation() {
  descField.addEventListener('input', () => {
    setFieldError('description', validateDescription(descField.value.trim()));
  });
  amountField.addEventListener('input', () => {
    setFieldError('amount', validateAmount(amountField.value.trim()));
  });
  categoryField.addEventListener('input', () => {
    setFieldError('category', validateCategory(categoryField.value.trim()));
  });
  dateField.addEventListener('input', () => {
    setFieldError('date', validateDate(dateField.value.trim()));
  });
}

// Search and Sort
function attachSearchAndSort() {
  searchInput.addEventListener('input', refreshRecordsList);
  caseInsensitiveCheckbox.addEventListener('change', refreshRecordsList);
  sortSelect.addEventListener('change', refreshRecordsList);
}

// Cap input
function attachCapInput() {
  capInput.addEventListener('input', () => {
    const val = parseFloat(capInput.value);
    if (!isNaN(val) && val >= 0) {
      updateSettings({ cap: val });
      refreshDashboard();
    }
  });
}

// Settings 
function attachSettings() {
  saveSettingsBtn.addEventListener('click', () => {
    const eur = parseFloat(rateEurInput.value);
    const rwf = parseFloat(rateRwfInput.value);

    if (isNaN(eur) || eur <= 0 || isNaN(rwf) || rwf <= 0) {
      setSettingsStatus('Please enter valid positive numbers for currency rates.');
      return;
    }

    updateSettings({
      rates: { USD: 1, EUR: eur, RWF: rwf },
      displayCurrency: displayCurrencySelect.value
    });

    setSettingsStatus('Settings saved.');
    refreshAll();
  });

  displayCurrencySelect.addEventListener('change', () => {
    updateSettings({ displayCurrency: displayCurrencySelect.value });
    refreshAll();
  });
}

// Import and Export
function attachImportExport() {
  exportBtn.addEventListener('click', () => {
    const data = JSON.stringify(getRecords(), null, 2);
    downloadFile(data, 'finance-records.json', 'application/json');
    setSettingsStatus('Records exported as JSON.');
  });

  exportCsvBtn.addEventListener('click', () => {
    const csv = recordsToCsv(getRecords());
    downloadFile(csv, 'finance-records.csv', 'text/csv');
    setSettingsStatus('Records exported as CSV.');
  });

  importFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        const { valid, error } = validateImportedRecords(parsed);
        if (!valid) {
          setSettingsStatus(`Import failed: ${error}`);
          return;
        }
        replaceAllRecords(parsed);
        setSettingsStatus(`Successfully imported ${parsed.length} record(s).`);
        refreshAll();
      } catch (err) {
        setSettingsStatus('Import failed: file is not valid JSON.');
        console.error(err);
      }
      importFile.value = '';
    };
    reader.onerror = () => {
      setSettingsStatus('Failed to read file.');
    };
    reader.readAsText(file);
  });
}

function recordsToCsv(records) {
  const headers = ['id', 'description', 'amount', 'category', 'date', 'createdAt', 'updatedAt'];
  const escapeCsv = (val) => {
    const str = String(val ?? '');
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const rows = [headers.join(',')];
  for (const r of records) {
    rows.push(headers.map(h => escapeCsv(r[h])).join(','));
  }
  return rows.join('\n');
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Theme toggle
function attachThemeToggle() {
  themeToggleBtn.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    if (newTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    updateSettings({ theme: newTheme });
    setSettingsStatus(`Switched to ${newTheme} theme.`);
  });
}

// Wire up everything
function attachEventListeners() {
  form.addEventListener('submit', handleFormSubmit);
  cancelEditBtn.addEventListener('click', handleCancelEdit);
  attachLiveValidation();
  attachSearchAndSort();
  attachCapInput();
  attachSettings();
  attachImportExport();
  attachThemeToggle();
}

document.addEventListener('DOMContentLoaded', init);
