/*
 * We'll use this whenever we need a simple hash table where
 * we want to enforce type.
 */
export interface HashTable<T> {
    [key: string]: T;
}