export type Parser<T> = (value: unknown, path: string) => T;
export function invalid(path: string, expected: string): never {
  throw new Error(`${path}: expected ${expected}.`);
}
export const string: Parser<string> = (v, p) => typeof v === 'string' ? v : invalid(p, 'a string');
// IDs are opaque, nonempty tokens; whitespace and control characters are invalid.
export const id: Parser<string> = (v, p) => typeof v === 'string' && /^[^\s\x00-\x1f\x7f]+$/u.test(v)
  ? v : invalid(p, 'a nonempty ID without whitespace/control characters');
export const boolean: Parser<boolean> = (v, p) => typeof v === 'boolean' ? v : invalid(p, 'a boolean');
export const number: Parser<number> = (v, p) => typeof v === 'number' && Number.isFinite(v)
  ? v : invalid(p, 'a finite number');
export const positive: Parser<number> = (v, p) => {
  const n = number(v, p);
  return n > 0 ? n : invalid(p, 'a positive number');
};
export function oneOf<const T extends string | number>(...values: T[]): Parser<T> {
  return (v, p) => values.find(x => x === v) ?? invalid(p, values.join(' | '));
}
export function optional<T>(parse: Parser<T>): Parser<T | undefined> {
  return (v, p) => v === undefined ? undefined : parse(v, p);
}
export function array<T>(parse: Parser<T>): Parser<T[]> {
  return (v, p) => Array.isArray(v) ? v.map((x, i) => parse(x, `${p}[${i}]`)) : invalid(p, 'an array');
}
// New contracts reject unknown keys instead of silently stripping metadata.
export function object<T extends object>(fields: { [K in keyof T]-?: Parser<T[K]> }): Parser<T> {
  return (v, p) => {
    if (!v || typeof v !== 'object' || Array.isArray(v)) return invalid(p, 'an object');
    for (const key of Object.keys(v)) if (!Object.hasOwn(fields, key)) invalid(`${p}.${key}`, 'a known field');
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(fields) as (keyof T & string)[]) {
      const parsed = fields[key](Object.hasOwn(v, key) ? Reflect.get(v, key) : undefined, `${p}.${key}`);
      if (parsed !== undefined) result[key] = parsed;
    }
    return result as T;
  };
}
export function unique<T>(values: T[], path: string): T[] {
  if (new Set(values).size !== values.length) invalid(path, 'unique entries');
  return values;
}
