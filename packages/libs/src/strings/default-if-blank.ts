/**
 * Returns the provided value if it is defined, non-null, and non-empty after trimming whitespace.
 * Otherwise, returns the fallback string.
 *
 * @template T - A type extending string (defaults to string).
 * @param {T | undefined | null} value - The input string to check.
 * @param {T} fallback - The fallback string to use if the value is blank.
 * @returns {string} The original value or the fallback.
 */
export function defaultIfBlank<T extends string = string>(
  value: T | undefined | null,
  fallback: T,
): string {
  if (value === null || value === undefined || value.trim() === '') {
    return fallback;
  }
  return value;
}
