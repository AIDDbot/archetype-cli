import { test, expect } from "../../shared/projects/cli.fixture.ts";
import { uniqueValue } from "../../shared/test-data/unique.make.ts";

test(
  "an unknown command writes one safe error and stops",
  { tag: "@S0002-R01" },
  async ({ cli }) => {
    const unknownCommand = uniqueValue("unknown-command");
    const result = await cli({
      arguments: [unknownCommand],
      environment: { FORCE_COLOR: undefined },
    });
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toMatch(/^error: [^\r\n]+\r?\n$/u);
    expect(result.stderr).not.toContain(unknownCommand);
    expect(result.stderr).not.toContain(" at ");
  },
);
