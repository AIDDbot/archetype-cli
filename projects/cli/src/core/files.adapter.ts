import { readFileSync } from "node:fs";
import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import type { TextFiles } from "#shared/files.type.ts";

export const textFiles: TextFiles = {
  read: (path) => readFile(path, "utf8"),
  write: (path, content) => writeFile(path, content, "utf8"),
};

export const logFiles = { mkdir, appendFile };

/** The root package.json of the system: projects/{project}/src/core/ is four folders below it. */
export const readSystemPackage = (): unknown =>
  JSON.parse(readFileSync(new URL("../../../../package.json", import.meta.url), "utf8"));
