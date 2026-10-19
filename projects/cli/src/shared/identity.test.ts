import { expect, test } from "vite-plus/test";
import {
  createIdentity,
  isPackageIdentity,
  parseIdentity,
  type PackageIdentity,
} from "./identity.value.ts";

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

test("parsing accepts a valid identity and rejects any other value", () => {
  expect(parseIdentity(metadata).version).toBe("2.0.0");
  expect(() => parseIdentity({ ...metadata, homepage: "" })).toThrow("Invalid identity");
});

test("identity metadata needs name, description, homepage and version as text", () => {
  expect(isPackageIdentity(metadata)).toBe(true);
  expect(isPackageIdentity({ ...metadata, version: 2 })).toBe(false);
  expect(isPackageIdentity("package")).toBe(false);
});
