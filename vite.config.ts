import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
    "*.ts": "vp test related --run --passWithNoTests",
  },
  fmt: { ignorePatterns: ["**/*.md", ".agents/**", ".aiddbot/**", "tools/**"] },
  lint: {
    ignorePatterns: [".agents/**", ".aiddbot/**", "tools/**"],
    plugins: ["typescript", "unicorn", "oxc", "import", "node", "promise", "vitest"],
    categories: { correctness: "error", suspicious: "error" },
    options: { typeAware: true, typeCheck: true },
    rules: {
      "typescript/no-non-null-assertion": "error",
      "import/no-unassigned-import": ["error", { allow: ["**/*.css"] }],
    },
  },
  test: { projects: ["projects/*"] },
});
