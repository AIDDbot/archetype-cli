import { expect, it } from "vitest";
import { features } from "./features.manifest.ts";
import { registerAbout } from "./about/about.routes.ts";

it("registers the about feature", () => {
  expect(features).toContain(registerAbout);
});
