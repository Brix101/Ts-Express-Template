// Exclude keys from user
export function exclude<T, Key extends keyof T>(
  obj: T,
  keys: Key[]
): Omit<T, Key> {
  for (let key of keys) {
    delete obj[key];
  }
  return obj;
}
