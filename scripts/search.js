// search.js - regex search and sorting helpers

import { compileRegex } from './validators.js';

// Filter records using a regex pattern against description and category.

export function searchRecords(records, pattern, caseInsensitive = true) {
  if (!pattern) {
    return { results: records, regex: null, error: null };
  }
  const flags = caseInsensitive ? 'i' : '';
  const regex = compileRegex(pattern, flags);
  if (!regex) {
    return { results: [], regex: null, error: 'Invalid regular expression.' };
  }
  const results = records.filter(r =>
    regex.test(r.description) || regex.test(r.category) || regex.test(r.date)
  );
  return { results, regex, error: null };
}

// Sort an array of records by the given key.

export function sortRecords(records, key) {
  const sorted = [...records];
  switch (key) {
    case 'date-asc':
      sorted.sort((a, b) => a.date.localeCompare(b.date));
      break;
    case 'date-desc':
      sorted.sort((a, b) => b.date.localeCompare(a.date));
      break;
    case 'desc-asc':
      sorted.sort((a, b) => a.description.localeCompare(b.description));
      break;
    case 'desc-desc':
      sorted.sort((a, b) => b.description.localeCompare(a.description));
      break;
    case 'amount-asc':
      sorted.sort((a, b) => a.amount - b.amount);
      break;
    case 'amount-desc':
      sorted.sort((a, b) => b.amount - a.amount);
      break;
    default:
      break;
  }
  return sorted;
}
