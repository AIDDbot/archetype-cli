import { defineConfig } from "vite-plus";

export default defineConfig({
  test: {
    name: "e2e",
    include: ["**/*.test.ts"],
    passWithNoTests: true,
    globalSetup: ["./core/settings/suite.setup.ts"],
  },
});
