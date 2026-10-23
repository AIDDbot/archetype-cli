import { describe, expect, it } from "vitest";
import { createApp, type Application } from "./app.compose.ts";

const options: Application = {
  features: [],
  identity: {
    displayName: "Fixture",
    description: "Test identity",
    author: { name: "Test author", url: "https://example.com" },
    version: "0.0.0",
  },
};

describe("lifecycle composition", () => {
  it("composes the supplied identity and manifest without changing the input", () => {
    const application = createApp(options);
    expect(application).toEqual(options);
    expect(application).not.toBe(options);
    expect(application.features).toBe(options.features);
    expect(application.identity).toBe(options.identity);
  });
});
