let counter = Date.now();

/** Generate a unique ID with optional prefix */
export function generateId(prefix: string = ""): string {
  return prefix + (counter++).toString(36);
}

/** Generate a short ID (8 chars) */
export function shortId(): string {
  return Math.random().toString(36).slice(2, 10);
}
