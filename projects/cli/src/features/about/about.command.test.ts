import { assert, expect, it } from "vitest";
import { registerAbout } from "./about.routes.ts";

it("presents the supplied identity with the fixed project technologies", async () => {
  const identity = {
    displayName: "Fixture",
    description: "Fixture description",
    version: "4.5.6",
    author: { name: "Fixture author", url: "https://example.com" },
  };
  const [command] = registerAbout({
    identity,
    settings: {
      readSetting: (definition) => definition.fallback,
      listSettings: () => [],
      getSetting: () => ({ name: "", value: "", source: "default" }),
      setSetting: async () => {},
    },
  });
  expect(command).toBeDefined();
  assert(command);
  expect(command.name).toBe("about");
  const result = await command.run({ arguments: [], options: {} });
  expect(result).toMatchObject({
    text: expect.stringContaining("Fixture author (https://example.com)"),
    json: {
      name: "Fixture",
      description: "Fixture description",
      version: "4.5.6",
      author: identity.author,
      projects: [
        {
          name: "cli",
          type: "cli",
          technologies: expect.arrayContaining(["TypeScript 7", "Node.js 26"]),
        },
        { name: "e2e", type: "e2e", technologies: expect.arrayContaining(["Vite+", "Vitest"]) },
      ],
    },
  });
});
