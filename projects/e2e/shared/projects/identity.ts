import { expect } from "vite-plus/test";

export interface ShownAuthor {
  name: string;
  url: string;
}
export interface ShownIdentity {
  name: string;
  description: string;
  version: string;
  author: ShownAuthor;
}

const SEMANTIC_VERSION = /^\d+\.\d+\.\d+$/;
const TEXT = /\S/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
function isText(value: unknown): value is string {
  return typeof value === "string" && TEXT.test(value);
}
function isShownAuthor(value: unknown): value is ShownAuthor {
  return isRecord(value) && isText(value.name) && isText(value.url);
}
function isShownIdentity(value: unknown): value is ShownIdentity {
  const isComplete = isRecord(value) && isText(value.name) && isText(value.description);
  return isComplete && isText(value.version) && isShownAuthor(value.author);
}

/** Checks that each identity field is there, never its value: the owner changes it. */
export function expectIdentity(data: unknown): ShownIdentity {
  expect(data).toMatchObject({
    name: expect.stringMatching(TEXT),
    description: expect.stringMatching(TEXT),
    version: expect.stringMatching(SEMANTIC_VERSION),
    author: { name: expect.stringMatching(TEXT), url: expect.stringMatching(/^https?:\/\//) },
  });
  const isShown = isShownIdentity(data);
  if (!isShown) throw new Error("The identity is not complete.");
  return data;
}

interface Named {
  name: string;
}
function isNamed(value: unknown): value is Named {
  return isRecord(value) && isText(value.name);
}

/** The application name that `help --json` shows. */
export function expectApplicationName(data: unknown): string {
  expect(data).toMatchObject({ name: expect.stringMatching(TEXT) });
  const hasName = isNamed(data);
  if (!hasName) throw new Error("The help has no application name.");
  return data.name;
}
