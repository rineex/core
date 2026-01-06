import isEmpty from 'lodash.isempty';
import isNil from 'lodash.isnil';

/**
 * Returns a default value if the input string is nil or empty.
 *
 * @param value - The input string to check.
 * @param defaultValue - The default string to return if input is nil or empty.
 * @returns The input string if non-empty, otherwise the default value.
 */
export function defaultIfBlank<T extends string = string>(
  value: T,
  defaultValue: T,
): T {
  if (isNil(value) || isEmpty(value)) {
    return defaultValue;
  }

  return value;
}

/**
 * Returns null if the input string is nil or empty, otherwise returns the input.
 *
 * @param value - The input string to check.
 * @returns The input string if non-empty, otherwise null.
 */
export function defaultIfNilOrEmpty<T extends string = string>(
  value: T | null | undefined,
): T | null {
  if (isNil(value) || isEmpty(value)) {
    return null;
  }

  return value;
}

export function defaultIfUndefinedOrEmpty<T extends string = string>(
  value: T | undefined,
): T | undefined {
  if (isNil(value) || isEmpty(value)) {
    return undefined;
  }

  return value;
}
