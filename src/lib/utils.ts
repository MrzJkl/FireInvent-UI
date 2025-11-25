// Rekursiv alle leeren Strings in null umwandeln (auch in Arrays und verschachtelten Objekten)
export function normalizeNullableStrings<T>(input: T): T {
  if (Array.isArray(input)) {
    return input.map(normalizeNullableStrings) as T;
  }
  if (input instanceof Date) {
    return input;
  }
  if (input !== null && typeof input === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(input)) {
      if (typeof value === 'string' && value.trim() === '') {
        result[key] = null;
      } else {
        result[key] = normalizeNullableStrings(value);
      }
    }
    return result;
  }
  return input;
}
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
