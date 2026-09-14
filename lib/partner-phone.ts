/** Indian mobile numbers are stored locally; Firebase Auth requires E.164. */
export function normalizePartnerPhone(value: string): string {
  let digits = value.trim().replace(/[\s()-]/g, '');
  if (digits.startsWith('+91')) digits = digits.slice(3);
  else if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  if (!/^[6-9]\d{9}$/.test(digits)) {
    throw new Error('Enter a valid 10-digit Indian mobile number, optionally prefixed with +91.');
  }
  return `+91${digits}`;
}
