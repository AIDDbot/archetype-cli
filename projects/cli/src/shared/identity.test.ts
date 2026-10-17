import { expect, test, vi } from "vite-plus/test";
import { join, parse } from "node:path";
import { readIdentity } from "./identity.search.ts";
import { createIdentity, isPackageIdentity, type PackageIdentity } from "./identity.value.ts";

const metadata: PackageIdentity = {
  name: "package-name",
  description: "Package description",
  homepage: "https://example.com",
  version: "2.0.0",
};

test("identity uses package metadata and defaults when author is absent", () => {
  expect(createIdentity(metadata)).toEqual({
    name: "package-name",
    description: "Package description",
    author: "AIDDbot",
    website: "https://aiddbot.com",
    version: "2.0.0",
  });
});

test.each(["Package author", { name: "Package author", url: "https://author.example" }])(
  "identity accepts author metadata %j",
  (author) => {
    expect(createIdentity({ ...metadata, displayName: "Application", author })).toEqual({
      name: "Application",
      description: metadata.description,
      author: "Package author",
      website: metadata.homepage,
      version: metadata.version,
    });
  },
);

test("identity search stops at the first workspace package", () => {
  const root = parse(import.meta.dirname).root;
  const parent = join(root, "workspace");
  const directory = join(parent, "source");
  const readWorkspace = vi.fn<(path: string) => PackageIdentity | undefined>();
  readWorkspace.mockReturnValueOnce(undefined).mockReturnValueOnce(metadata);
  expect(readIdentity(directory, readWorkspace)).toBe(metadata);
  expect(readWorkspace.mock.calls).toEqual([[directory], [parent]]);
});

test("identity search reports missing workspace metadata before reading the root", () => {
  const root = parse(import.meta.dirname).root;
  const directory = join(root, "workspace");
  const readWorkspace = vi.fn<(path: string) => PackageIdentity | undefined>();
  expect(() => readIdentity(directory, readWorkspace)).toThrow(
    "Application package.json is unavailable",
  );
  expect(readWorkspace.mock.calls).toEqual([[directory]]);
});

test("identity metadata needs name, description, homepage and version as text", () => {
  expect(isPackageIdentity(metadata)).toBe(true);
  expect(isPackageIdentity({ ...metadata, version: 2 })).toBe(false);
  expect(isPackageIdentity("package")).toBe(false);
});
