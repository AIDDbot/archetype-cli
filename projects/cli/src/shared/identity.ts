import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readIdentity } from "./identity.search.ts";
import { createIdentity, type PackageIdentity } from "./identity.value.ts";
function readWorkspace(directory: string): PackageIdentity | undefined {
  const path = join(directory, "package.json");
  if (!existsSync(path)) return undefined;
  const metadata = JSON.parse(readFileSync(path, "utf8")) as PackageIdentity;
  return metadata.workspaces === undefined ? undefined : metadata;
}
export const identity = createIdentity(
  readIdentity(dirname(fileURLToPath(import.meta.url)), readWorkspace),
);
