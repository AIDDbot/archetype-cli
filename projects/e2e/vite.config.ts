import "./core/settings.ts";
import { defineConfig } from "vite-plus";
export default defineConfig({
  test: {
    name: "e2e",
    include: ["features/**/*.test.ts", "features/**/*.cli.spec.ts"],
    passWithNoTests: true,
  },
});
