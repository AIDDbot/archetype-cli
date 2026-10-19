import { dirname, parse } from "node:path";
import type { PackageIdentity } from "./identity.value.ts";

const isRoot = (directory: string) => directory === parse(directory).root;

export function readIdentity(
  directory: string,
  readWorkspace: (directory: string) => PackageIdentity | undefined,
): PackageIdentity {
  while (!isRoot(directory)) {
    const metadata = readWorkspace(directory);
    const hasIdentity = metadata !== undefined;
    if (hasIdentity) return metadata;
    directory = dirname(directory);
  }
  throw new Error("Application package.json is unavailable");
}
