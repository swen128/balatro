export type NonEmptyArray<T> = [T, ...T[]];

export const nonEmptyArray = <T>(array: T[]): NonEmptyArray<T> | undefined => {
    return isNonEmpty(array) ? array : undefined;
}

const isNonEmpty = <T>(array: T[]): array is NonEmptyArray<T> => {
    return array.length !== 0;
}

// // This is more type-safe but might be inefficient for large arrays.
// const nonEmptyArray = <T>(array: T[]): NonEmptyArray<T> | undefined => {
//     const [head, ...tail] = array;
//     return head === undefined ? undefined : [head, ...tail];
// }
