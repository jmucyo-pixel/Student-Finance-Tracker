// No spaces at start or end, and no double spaces
export const RE_DESCRIPTION = /^\S(?:.*\S)?$/;
export const RE_NO_DOUBLE_SPACE = /^(?!.*\s{2}).*$/;

// Allows 1.11 and numbers in this format. Can't start with 0 unless its just 0 or like 0.99
export const RE_AMOUNT = /^(0|[1-9]\d*)(\.\d{1,2})?$/;

// Date in YYYY-MM-DD format
export const RE_DATE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

// Allows letters, spaces, hyphens only, and single spaces between words
export const RE_CATEGORY = /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/;

// Detect duplicate consecutive words using a back-reference
export const RE_DUPLICATE_WORD = /\b(\w+)\s+\1\b/i;

// Validates description field
export function validateDescription(value) {
  if (!value) return 'Description is required.';
  if (!RE_DESCRIPTION.test(value)) {
    return 'Description cannot start or end with a space.';
  }
  if (!RE_NO_DOUBLE_SPACE.test(value)) {
    return 'Description cannot contain double spaces.';
  }
  if (RE_DUPLICATE_WORD.test(value)) {
    return `Description contains a duplicated word ("${RE_DUPLICATE_WORD.exec(value)[1]}").`;
  }
  if (value.length > 80) {
    return 'Description must be 80 characters or fewer.';
  }
  return '';
}

// Validate the amount field. Expects a string from the input.
 
export function validateAmount(value) {
  if (!value) return 'Amount is required.';
  if (!RE_AMOUNT.test(value)) {
    return 'Amount must be a positive number with up to 2 decimal places (e.g. 1.11).';
  }
  const num = parseFloat(value);
  if (num <= 0) return 'Amount must be greater than 0.';
  if (num > 1000000) return 'Amount seems too large.';
  return '';
}

// Validate the date field (YYYY-MM-DD).
 
export function validateDate(value) {
  if (!value) return 'Date is required.';
  if (!RE_DATE.test(value)) {
    return 'Date must be in YYYY-MM-DD format (e.g. 2025-09-29).';
  }
  // Extra check: ensure it's a real calendar date
  const [y, m, d] = value.split('-').map(Number);
  const dateObj = new Date(Date.UTC(y, m - 1, d));
  if (dateObj.getUTCFullYear() !== y || dateObj.getUTCMonth() !== m - 1 || dateObj.getUTCDate() !== d) {
    return 'Date does not exist on the calendar.';
  }
  return '';
}

// Validate the category field.

export function validateCategory(value) {
  if (!value) return 'Category is required.';
  if (!RE_CATEGORY.test(value)) {
    return 'Category may only contain letters, single spaces, or hyphens (e.g. "Food").';
  }
  return '';
}

/**
 * Compile a user-supplied regex string safely.
 * Returns a RegExp instance, or null if input is empty/invalid.
 */
export function compileRegex(input, flags = 'i') {
  try {
    return input ? new RegExp(input, flags) : null;
  } catch {
    return null;
  }
}

/**
 * Wrap matches of `re` in a string with <mark> tags.
 * Escapes the surrounding text first to avoid HTML injection,
 * then applies highlighting safely.
 */
export function highlight(text, re) {
  const escaped = escapeHtml(text);
  if (!re) return escaped;
  // Build a global version of the regex so all matches are highlighted
  const flags = re.flags.includes('g') ? re.flags : re.flags + 'g';
  let globalRe;
  try {
    globalRe = new RegExp(re.source, flags);
  } catch {
    return escaped;
  }
  return escaped.replace(globalRe, (m) => `<mark>${escapeHtml(m)}</mark>`);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
