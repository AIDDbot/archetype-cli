import { isRecord, isText } from "#shared/values/checks.guard.ts";
export interface PackageIdentity {
  name: string;
  displayName?: string;
  description: string;
  author?: string | { name: string; url?: string };
  homepage: string;
  version: string;
}

export function isPackageIdentity(value: unknown): value is PackageIdentity {
  if (!isRecord(value)) return false;
  const required = [value.name, value.description, value.homepage, value.version];
  return required.every(isText);
}

function authorName(author: PackageIdentity["author"]): string {
  const hasAuthor = author !== undefined;
  if (!hasAuthor) return "AIDDbot";
  const isName = typeof author === "string";
  return isName ? author : author.name;
}

export type Identity = ReturnType<typeof createIdentity>;

export function parseIdentity(metadata: unknown): Identity {
  if (!isPackageIdentity(metadata)) throw new Error("Invalid identity in the root package.json");
  return createIdentity(metadata);
}

export function createIdentity(metadata: PackageIdentity) {
  const hasAuthor = metadata.author !== undefined;
  return {
    name: metadata.displayName ?? metadata.name,
    description: metadata.description,
    author: authorName(metadata.author),
    website: hasAuthor ? metadata.homepage : "https://aiddbot.com",
    version: metadata.version,
  };
}
