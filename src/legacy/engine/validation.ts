// Small JSON parsers shared by the three data schemas.
export type Parser<T> = (value: unknown, path: string) => T;

function invalid(path: string, expected: string): never {
  throw new Error(`${path}: expected ${expected}.`);
}

export const string: Parser<string> = (value, path) =>
  typeof value === 'string' ? value : invalid(path, 'a string');

export const boolean: Parser<boolean> = (value, path) =>
  typeof value === 'boolean' ? value : invalid(path, 'a boolean');

export const number: Parser<number> = (value, path) =>
  typeof value === 'number' && Number.isFinite(value)
    ? value
    : invalid(path, 'a finite number');

export function oneOf<const T extends string>(...values: T[]): Parser<T> {
  return (value, path) => {
    for (const candidate of values) {
      if (value === candidate) return candidate;
    }
    return invalid(path, values.join(' | '));
  };
}

export function optional<T>(parse: Parser<T>): Parser<T | undefined> {
  return (value, path) => value === undefined ? undefined : parse(value, path);
}

export function array<T>(parse: Parser<T>): Parser<T[]> {
  return (value, path) => {
    if (!Array.isArray(value)) return invalid(path, 'an array');
    return value.map((item: unknown, index) => parse(item, `${path}[${index}]`));
  };
}

export function object<T extends object>(
  fields: { [K in keyof T]-?: Parser<T[K]> },
): Parser<T> {
  return (value, path) => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return invalid(path, 'an object');
    }
    const parsed: Record<string, unknown> = {};
    for (const key of Object.keys(fields) as (keyof T & string)[]) {
      const field = Object.hasOwn(value, key) ? Reflect.get(value, key) : undefined;
      const result = fields[key](field, `${path}.${key}`);
      if (result !== undefined) parsed[key] = result;
    }
    // Every declared field has been parsed; absent optional fields stay absent.
    return parsed as T;
  };
}

export const intensity = oneOf('mild', 'spicy', 'wild');
