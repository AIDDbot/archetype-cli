import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import type { TextFiles } from "#shared/settings/files.type.ts";

export const textFiles: TextFiles = {
  read: (path) => readFile(path, "utf8"),
  write: (path, content) => writeFile(path, content, "utf8"),
};

export const logFiles = { mkdir, appendFile };
