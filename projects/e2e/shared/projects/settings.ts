import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
const directory = fileURLToPath(new URL("../../", import.meta.url));
function read(name: string, fallback: string) {
  const value = process.env[name] ?? fallback;
  const isBlank = value.trim().length === 0;
  if (isBlank) throw new Error(`Invalid ${name}`);
  return value;
}
export const cliDirectory = resolve(directory, read("CLI_DIRECTORY", "../cli"));
export const cliStart = read("CLI_START", "node src/app.main.ts");
