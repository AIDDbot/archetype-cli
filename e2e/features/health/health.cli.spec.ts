import { test, expect } from "../../shared/projects/cli.fixture.ts";
import { withTemporaryStore } from "../../shared/test-data/store.make.ts";

type HealthAnswer = Readonly<{ status: string; runs: number }>;

function readAnswer(stdout: string): HealthAnswer {
  return JSON.parse(stdout.trim().split("\n").at(-1)!) as HealthAnswer;
}

test(
  "health returns its status and persistent invocation count",
  { tag: "@S0003-R01" },
  async ({ cli }) => {
    await withTemporaryStore(async ({ database }) => {
      const first = await cli({ arguments: ["health"], database });
      const second = await cli({ arguments: ["health"], database });
      expect(first.exitCode).toBe(0);
      expect(second.exitCode).toBe(0);
      const firstAnswer = readAnswer(first.stdout);
      const secondAnswer = readAnswer(second.stdout);
      expect(Object.keys(firstAnswer).sort()).toEqual(["runs", "status"]);
      expect(Object.keys(secondAnswer).sort()).toEqual(["runs", "status"]);
      expect(firstAnswer.status).toBe("ok");
      expect(secondAnswer.status).toBe("ok");
      expect(Number.isInteger(firstAnswer.runs)).toBe(true);
      expect(secondAnswer.runs).toBe(firstAnswer.runs + 1);
    });
  },
);

test(
  "health reports a store failure without a successful answer",
  { tag: "@S0003-R01" },
  async ({ cli }) => {
    await withTemporaryStore(async ({ directory }) => {
      const result = await cli({
        arguments: ["health"],
        database: directory,
        environment: { FORCE_COLOR: undefined },
      });
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toMatch(/^error: [^\r\n]+\r?\n$/u);
      expect(result.stderr).not.toContain(directory);
      expect(result.stdout).not.toContain('"status"');
      expect(result.stdout).not.toContain('"runs"');
    });
  },
);
