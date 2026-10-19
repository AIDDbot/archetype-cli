import { expect, test } from "vite-plus/test";
import { join } from "node:path";
import { loadIdentity, readWorkspace } from "./app.identity.ts";

const root = join("/system");
const workspace = {
  name: "system",
  displayName: "System",
  description: "A system",
  homepage: "https://example.com",
  version: "1.2.3",
  workspaces: ["projects/*"],
};

function fakeFiles(contents: Record<string, unknown>) {
  const texts = new Map(
    Object.entries(contents).map(([path, value]) => [path, JSON.stringify(value)]),
  );
  return {
    exists: (path: string) => texts.has(path),
    read: (path: string) => texts.get(path) ?? "",
  };
}

test("reads the identity of the nearest workspace above the project", () => {
  const files = fakeFiles({
    [join(root, "projects", "cli", "package.json")]: { name: "cli" },
    [join(root, "package.json")]: workspace,
  });
  expect(loadIdentity(join(root, "projects", "cli", "src"), files)).toMatchObject({
    name: "System",
    version: "1.2.3",
  });
});

test("skips a missing package and a package that is no workspace", () => {
  const files = fakeFiles({ [join(root, "package.json")]: { name: "cli" } });
  expect(readWorkspace(join(root, "none"), files)).toBeUndefined();
  expect(readWorkspace(root, files)).toBeUndefined();
});

test("rejects a workspace without a valid identity", () => {
  const files = fakeFiles({ [join(root, "package.json")]: { workspaces: [] } });
  expect(() => readWorkspace(root, files)).toThrow("Invalid identity");
});
