import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeNullableStrings<T>(input: T): T {
  if (Array.isArray(input)) {
    return input.map(normalizeNullableStrings) as T;
  }
  if (input instanceof Date) {
    return input;
  }
  if (input !== null && typeof input === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      if (typeof value === 'string' && value.trim() === '') {
        result[key] = null;
      } else {
        result[key] = normalizeNullableStrings(value);
      }
    }
    return result as T;
  }
  return input;
}
