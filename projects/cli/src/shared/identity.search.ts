import { dirname, parse } from "node:path";
import type { PackageIdentity } from "./identity.value.ts";

export function readIdentity(
  directory: string,
  readWorkspace: (directory: string) => PackageIdentity | undefined,
): PackageIdentity {
  while (directory !== parse(directory).root) {
    const metadata = readWorkspace(directory);
    if (metadata !== undefined) return metadata;
    directory = dirname(directory);
  }
  throw new Error("Application package.json is unavailable");
}
