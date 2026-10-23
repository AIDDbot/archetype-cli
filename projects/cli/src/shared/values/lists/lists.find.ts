import { ExpectedError } from "#shared/expected.error.ts";

export type Named = { name: string };

export type NamedKind = { name: string; kind: string };

export function findByName<Item extends Named>(
  items: readonly Item[],
  name: string,
): Item | undefined {
  return items.find((item) => item.name === name);
}

export function requireByName<Item extends Named>(items: readonly Item[], wanted: NamedKind): Item {
  const found = findByName(items, wanted.name);
  const isUnknown = found === undefined;
  if (isUnknown) {
    throw new ExpectedError({
      kind: "rule",
      message: `${wanted.kind} "${wanted.name}" is unknown`,
    });
  }
  return found;
}
