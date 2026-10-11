import { readFileSync } from "node:fs";

export function readVersion(): string {
  const identity = JSON.parse(
    readFileSync(new URL("../../../package.json", import.meta.url), "utf8"),
  ) as { version: string };
  return identity.version;
}
