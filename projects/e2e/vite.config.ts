import { defineConfig } from "vite-plus";
import { checkSettings } from "./core/settings.ts";
checkSettings();
export default defineConfig({
  test: {
    name: "e2e",
    include: ["features/**/*.test.ts", "features/**/*.cli.spec.ts"],
    passWithNoTests: true,
  },
});
