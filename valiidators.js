// No spaces at start or end, and no double spaces
export const RE_DESCRIPTION = /^\S(?:.*\S)?$/;
export const RE_NO_DOUBLE_SPACE = /^(?!.*\s{2}).*$/;

// Allows 1.11 and numbers in this format. Can't start with 0 unless its just 0 or like 0.99
export const RE_AMOUNT = /^(0|[1-9]\d*)(\.\d{1,2})?$/;

// Date in YYYY-MM-DD format
export const RE_DATE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

// Allows letters, spaces, hyphens only, and single spaces between words
export const RE_CATEGORY = /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/;

// detect duplicate consecutive words using a back-reference
export const RE_DUPLICATE_WORD = /\b(\w+)\s+\1\b/i;