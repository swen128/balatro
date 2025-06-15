export function filterDefined<T>(array: ReadonlyArray<T | null | undefined>): ReadonlyArray<T> {
  return array.filter((item) => item !== null && item !== undefined);
}