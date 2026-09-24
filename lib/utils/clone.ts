/**
 * Centralized deep clone utility.
 *
 * Primary cloning algorithm uses native `structuredClone` to preserve
 * complex JavaScript types (`Date`, `Map`, `Set`, `RegExp`, `undefined`, `ArrayBuffer`, etc.)
 * without lossy JSON serialization.
 *
 * If `structuredClone` fails (e.g. `DataCloneError` due to non-serializable properties like
 * functions, symbols, or DOM nodes), a resilient recursive fallback handles object cloning
 * while preserving `undefined` fields and preventing crashes.
 */

function cloneDeepFallback<T>(
  value: T,
  cache = new WeakMap<object, unknown>()
): T {
  // Handle primitives and null/undefined
  if (value === null || typeof value !== "object") {
    return value;
  }

  // Handle functions (return as-is since functions are immutable references)
  if (typeof value === "function") {
    return value;
  }

  // Handle circular references
  if (cache.has(value as object)) {
    return cache.get(value as object) as T;
  }

  // Handle Date
  if (value instanceof Date) {
    const clonedDate = new Date(value.getTime());
    cache.set(value as object, clonedDate);
    return clonedDate as unknown as T;
  }

  // Handle RegExp
  if (value instanceof RegExp) {
    const clonedRegExp = new RegExp(value.source, value.flags);
    clonedRegExp.lastIndex = value.lastIndex;
    cache.set(value as object, clonedRegExp);
    return clonedRegExp as unknown as T;
  }

  // Handle Map
  if (value instanceof Map) {
    const clonedMap = new Map();
    cache.set(value as object, clonedMap);
    value.forEach((val, key) => {
      clonedMap.set(
        cloneDeepFallback(key, cache),
        cloneDeepFallback(val, cache)
      );
    });
    return clonedMap as unknown as T;
  }

  // Handle Set
  if (value instanceof Set) {
    const clonedSet = new Set();
    cache.set(value as object, clonedSet);
    value.forEach((val) => {
      clonedSet.add(cloneDeepFallback(val, cache));
    });
    return clonedSet as unknown as T;
  }

  // Handle ArrayBuffer / TypedArray
  if (ArrayBuffer.isView(value)) {
    const typedArray = value as unknown as Uint8Array;
    const clonedTypedArray = typedArray.slice();
    cache.set(value as object, clonedTypedArray);
    return clonedTypedArray as unknown as T;
  }

  // Handle Array
  if (Array.isArray(value)) {
    const clonedArray: unknown[] = [];
    cache.set(value as object, clonedArray);
    for (let i = 0; i < value.length; i++) {
      clonedArray[i] = cloneDeepFallback(value[i], cache);
    }
    return clonedArray as unknown as T;
  }

  // Handle Plain Objects and Custom Object instances
  const proto = Object.getPrototypeOf(value);
  const clonedObj = Object.create(proto);
  cache.set(value as object, clonedObj);

  const keys = Reflect.ownKeys(value as object);
  const recordValue = value as unknown as Record<string | symbol, unknown>;
  const recordCloned = clonedObj as Record<string | symbol, unknown>;

  for (const key of keys) {
    const descriptor = Object.getOwnPropertyDescriptor(value as object, key);
    if (descriptor) {
      if (descriptor.get || descriptor.set) {
        Object.defineProperty(clonedObj, key, descriptor);
      } else {
        recordCloned[key] = cloneDeepFallback(recordValue[key], cache);
      }
    }
  }

  return clonedObj as T;
}

/**
 * Deeply clones a value using native `structuredClone` with a resilient recursive fallback.
 *
 * @param value The value to clone.
 * @returns A deep clone of the value.
 */
export function cloneDeep<T>(value: T): T {
  if (value === null || typeof value !== "object") {
    return value;
  }

  try {
    return structuredClone(value);
  } catch (_err) {
    return cloneDeepFallback(value);
  }
}
