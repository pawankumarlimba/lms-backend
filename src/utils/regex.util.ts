/**
 * Indian PAN format: 5 letters, 4 digits, 1 letter. e.g. ABCDE1234F.
 * Kept in one place so the same pattern is used by the DTO validator,
 * the BRE PAN rule, and (mirrored) on the frontend - no drift.
 */
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
