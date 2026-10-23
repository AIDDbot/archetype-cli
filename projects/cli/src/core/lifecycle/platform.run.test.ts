const application = {
  features: [],
  identity: {
    displayName: "Fixture",
    description: "Test",
    version: "1.0.0",
    author: { name: "A", url: "u" },
  },
};
import { resolve } from "node:path";
import { expect, it, vi } from "vitest";
import { start } from "./app.start.ts";
import { runPlatform, type Platform } from "./platform.run.ts";

function fixture(): Platform {
  return {
    stdout: vi.fn<Platform["stdout"]>(),
    directory: "/project",
    args: [],
    environment: {},
    read: vi.fn<Platform["read"]>(async () => undefined),
    write: vi.fn<Platform["write"]>(async () => {}),
    append: vi.fn<Platform["append"]>(async () => {}),
    stderr: vi.fn<Platform["stderr"]>(),
    exit: vi.fn<Platform["exit"]>(),
    clock: () => 1,
    date: () => new Date(2026, 0, 2),
  };
}
it.each([["--version"], ["--version", "--json"]])("writes only the version %j", async (...args) => {
  const runtime = { ...fixture(), args };
  await runPlatform(runtime, application);
  expect(runtime.stdout).toHaveBeenCalledExactlyOnceWith("1.0.0\n");
  expect(runtime.stderr).not.toHaveBeenCalled();
  expect(runtime.exit).toHaveBeenCalledExactlyOnceWith(0);
  expect(runtime.read).not.toHaveBeenCalled();
});
it("loads settings and stops a successful invocation", async () => {
  const runtime = fixture();
  const identity = {
    displayName: "Fixture",
    description: "Fixture",
    version: "0.0.0",
    author: { name: "Fixture", url: "fixture" },
  };
  const supplied = { features: [], identity };
  await expect(start(supplied, runtime)).resolves.toEqual(supplied);
  expect(runtime.read).toHaveBeenCalledExactlyOnceWith(resolve("/project", "config.json"));
  expect(runtime.exit).toHaveBeenCalledExactlyOnceWith(0);
  expect(runtime.append).toHaveBeenCalledWith(
    `${resolve("/project", "logs")}/2026-01-02.log`,
    "00:00:00.000 cli INFO command= exit=0 duration=0ms\n",
  );
});
it("applies options to bootstrap logging before reading configuration", async () => {
  const runtime = {
    ...fixture(),
    args: ["sample", "--config-file", "custom.json", "--log-dir", "custom-logs"],
    read: vi.fn<Platform["read"]>(async () => "bad"),
  };
  await runPlatform(runtime, application);
  expect(runtime.read).toHaveBeenCalledWith(resolve("/project", "custom.json"));
  expect(runtime.exit).toHaveBeenCalledWith(3);
  expect(runtime.append).toHaveBeenCalledWith(
    `${resolve("/project", "custom-logs")}/2026-01-02.log`,
    expect.stringContaining("command=sample exit=3"),
  );
});
it("applies configuration logging settings", async () => {
  const runtime = {
    ...fixture(),
    read: async () => '{"LOG_DIR":"configured","LOG_LEVEL":"debug"}',
  };
  await runPlatform(runtime, application);
  expect(runtime.append).toHaveBeenCalledWith(
    `${resolve("/project", "configured")}/2026-01-02.log`,
    expect.stringContaining("exit=0"),
  );
});
it("logs invalid arguments through environment settings", async () => {
  const runtime = { ...fixture(), args: ["--unknown"], environment: { LOG_DIR: "early" } };
  await runPlatform(runtime, application);
  expect(runtime.exit).toHaveBeenCalledWith(2);
  expect(runtime.append).toHaveBeenCalledWith(
    `${resolve("/project", "early")}/2026-01-02.log`,
    expect.stringContaining("exit=2"),
  );
});
it("validates settings before execution and avoids an invalid log directory", async () => {
  const runtime = { ...fixture(), environment: { LOG_DIR: "" } };
  await runPlatform(runtime, application);
  expect(runtime.exit).toHaveBeenCalledWith(3);
  expect(runtime.append).not.toHaveBeenCalled();
});
it("registers features with identity and settings and renders JSON failures", async () => {
  const runtime = { ...fixture(), args: ["help", "--json"] };
  const register = vi.fn<() => never[]>(() => {
    return [];
  });
  await runPlatform(runtime, {
    ...application,
    features: [
      (input) => {
        input.settings.readSetting({
          name: "CUSTOM",
          option: "custom",
          fallback: "x",
          check: String,
        });
        return register();
      },
    ],
  });
  expect(register).toHaveBeenCalledOnce();
  expect(runtime.stdout).toHaveBeenCalledWith(expect.stringContaining('"name":"Fixture"'));
  await runPlatform({ ...runtime, args: ["bad", "--json"] }, application);
  expect(runtime.stdout).toHaveBeenCalledWith('{"error":"Unknown command: bad"}\n');
  expect(runtime.stderr).not.toHaveBeenCalled();
});
it("reports a positional JSON token as a text usage failure with urgent logs", async () => {
  const runtime = { ...fixture(), args: ["--", "--json"] };
  await runPlatform(runtime, application);
  expect(runtime.exit).toHaveBeenCalledExactlyOnceWith(2);
  expect(runtime.stdout).not.toHaveBeenCalled();
  expect(runtime.stderr).toHaveBeenCalledWith(
    expect.stringMatching(/error: Unknown command: --json\n[\s\S]*Usage:/),
  );
  expect(runtime.stderr).toHaveBeenCalledWith(expect.stringContaining("Failure: usage"));
});
it.each([
  ["--json", "help", "--unknown"],
  ["help", "--unknown", "--json"],
  ["--json", "help", "--log-dir"],
])("renders parser failures as JSON without urgent stderr logs %j", async (...args) => {
  const runtime = { ...fixture(), args };
  await runPlatform(runtime, application);
  expect(runtime.exit).toHaveBeenCalledExactlyOnceWith(2);
  expect(runtime.stdout).toHaveBeenCalledExactlyOnceWith('{"error":"Invalid command arguments"}\n');
  expect(runtime.stderr).not.toHaveBeenCalled();
});
