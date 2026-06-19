// ui.js - DOM rendering functions

import { highlight } from './validators.js';
import { convertCurrency, currencyLabel } from './state.js';

// Render the records table (desktop) and cards (mobile) for records, regex, settings, and handlers.

export function renderRecords(records, regex, settings, handlers) {
  const tbody = document.getElementById('records-tbody');
  const cardsList = document.getElementById('records-cards');
  const emptyState = document.getElementById('empty-state');

  tbody.innerHTML = '';
  cardsList.innerHTML = '';

  if (records.length === 0) {
    emptyState.hidden = false;
  } else {
    emptyState.hidden = true;
  }

  for (const r of records) {
    const displayAmount = convertCurrency(r.amount, settings.displayCurrency);
    const amountStr = currencyLabel(displayAmount, settings.displayCurrency);

    // ---- Table row ----
    const tr = document.createElement('tr');

    const tdDesc = document.createElement('td');
    tdDesc.innerHTML = highlight(r.description, regex);

    const tdAmount = document.createElement('td');
    tdAmount.textContent = amountStr;

    const tdCategory = document.createElement('td');
    tdCategory.innerHTML = highlight(r.category, regex);

    const tdDate = document.createElement('td');
    tdDate.innerHTML = highlight(r.date, regex);

    const tdActions = document.createElement('td');
    const editBtn = makeButton('Edit', `Edit ${r.description}`, 'icon-btn secondary', () => handlers.onEdit(r.id));
    const delBtn = makeButton('Delete', `Delete ${r.description}`, 'icon-btn danger', () => handlers.onDelete(r.id));
    tdActions.append(editBtn, delBtn);

    tr.append(tdDesc, tdAmount, tdCategory, tdDate, tdActions);
    tbody.appendChild(tr);

    // ---- Card (mobile) ----
    const li = document.createElement('li');
    li.className = 'record-card';

    const h3 = document.createElement('h3');
    h3.innerHTML = highlight(r.description, regex);

    const dl = document.createElement('dl');
    dl.innerHTML = `
      <dt>Amount</dt><dd>${escapeForDisplay(amountStr)}</dd>
      <dt>Category</dt><dd>${highlight(r.category, regex)}</dd>
      <dt>Date</dt><dd>${highlight(r.date, regex)}</dd>
    `;

    const actions = document.createElement('div');
    actions.className = 'record-actions';
    const cardEditBtn = makeButton('Edit', `Edit ${r.description}`, 'secondary', () => handlers.onEdit(r.id));
    const cardDelBtn = makeButton('Delete', `Delete ${r.description}`, 'danger', () => handlers.onDelete(r.id));
    actions.append(cardEditBtn, cardDelBtn);

    li.append(h3, dl, actions);
    cardsList.appendChild(li);
  }
}

function makeButton(label, ariaLabel, className, onClick) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = label;
  btn.className = className;
  btn.setAttribute('aria-label', ariaLabel);
  btn.addEventListener('click', onClick);
  return btn;
}

function escapeForDisplay(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Render dashboard stats.

export function renderStats({ total, sum, topCategory, last7Sum, settings }) {
  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-sum').textContent = currencyLabel(
    convertCurrency(sum, settings.displayCurrency), settings.displayCurrency
  );
  document.getElementById('stat-top').textContent = topCategory;
  document.getElementById('stat-7days').textContent = currencyLabel(
    convertCurrency(last7Sum, settings.displayCurrency), settings.displayCurrency
  );
}

// Render the 7-day trend chart as simple CSS bars.

export function renderTrendChart(trendData, settings) {
  const container = document.getElementById('trend-chart');
  container.innerHTML = '';

  const max = Math.max(...trendData.map(d => d.total), 1);

  for (const day of trendData) {
    const bar = document.createElement('div');
    bar.className = 'trend-bar';
    const heightPct = Math.max((day.total / max) * 100, 2);
    bar.style.height = `${heightPct}%`;

    const label = document.createElement('span');
    label.className = 'trend-bar-label';
    label.textContent = day.label;
    bar.appendChild(label);

    const amountStr = currencyLabel(convertCurrency(day.total, settings.displayCurrency), settings.displayCurrency);
    bar.title = `${day.label}: ${amountStr}`;

    container.appendChild(bar);
  }

  container.setAttribute('aria-label', `Spending trend for the last 7 days. ` +
    trendData.map(d => `${d.label}: ${currencyLabel(convertCurrency(d.total, settings.displayCurrency), settings.displayCurrency)}`).join(', '));
}

// Render the cap status message with appropriate ARIA live behaviour.

export function renderCapStatus(sum, cap, settings) {
  const el = document.getElementById('cap-status');
  const sumDisplay = convertCurrency(sum, settings.displayCurrency);
  const capDisplay = convertCurrency(cap, settings.displayCurrency);
  const remaining = capDisplay - sumDisplay;

  el.classList.remove('over', 'under');

  if (remaining < 0) {
    el.setAttribute('aria-live', 'assertive');
    el.classList.add('over');
    el.textContent = `Over budget by ${currencyLabel(Math.abs(remaining), settings.displayCurrency)}.`;
  } else {
    el.setAttribute('aria-live', 'polite');
    el.classList.add('under');
    el.textContent = `Remaining budget: ${currencyLabel(remaining, settings.displayCurrency)}.`;
  }
}

// Show a field-level error message and toggle invalid styling.

export function setFieldError(fieldId, message) {
  const input = document.getElementById(fieldId);
  const errorEl = document.getElementById(`${fieldId}-error`);
  if (errorEl) errorEl.textContent = message;
  if (input) {
    if (message) {
      input.classList.add('invalid');
      input.setAttribute('aria-invalid', 'true');
    } else {
      input.classList.remove('invalid');
      input.removeAttribute('aria-invalid');
    }
  }
}

// Show a status message in the form area.

export function setFormStatus(message, type) {
  const el = document.getElementById('form-status');
  el.textContent = message;
  el.classList.remove('success', 'error');
  if (type) el.classList.add(type);
}

// Update the search status message for screen readers.

export function setSearchStatus(message) {
  document.getElementById('search-status').textContent = message;
}

// Show a status message in the settings area.
 
export function setSettingsStatus(message) {
  document.getElementById('settings-status').textContent = message;
}
