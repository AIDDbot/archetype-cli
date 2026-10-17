import { isRecord, isText } from "./checks.guard.ts";
export interface PackageIdentity {
  name: string;
  displayName?: string;
  description: string;
  author?: string | { name: string; url?: string };
  homepage: string;
  version: string;
  workspaces?: string[];
}

export function isPackageIdentity(value: unknown): value is PackageIdentity {
  if (!isRecord(value)) return false;
  const required = [value.name, value.description, value.homepage, value.version];
  return required.every(isText);
}

export function createIdentity(metadata: PackageIdentity) {
  return {
    name: metadata.displayName ?? metadata.name,
    description: metadata.description,
    author:
      metadata.author === undefined
        ? "AIDDbot"
        : typeof metadata.author === "string"
          ? metadata.author
          : metadata.author.name,
    website: metadata.author === undefined ? "https://aiddbot.com" : metadata.homepage,
    version: metadata.version,
  };
}
