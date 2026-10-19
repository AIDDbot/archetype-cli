import { readFileSync } from "node:fs";

const rootPackage = new URL("../../../../package.json", import.meta.url);

/** The identity of the system, from the root `package.json`, read once. */
export const identity = JSON.parse(readFileSync(rootPackage, "utf8"));
