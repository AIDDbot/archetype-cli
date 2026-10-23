import { expect, it, vi } from "vitest";
import { definitions } from "#core/settings/settings.definitions.ts";
import { parseArguments, type ArgumentInput } from "./arguments.parse.ts";

it("parses all declared options and the command", () => {
  expect(
    parseArguments({
      args: ["config", "--log-level", "debug", "--config-file=x", "--log-dir", "y"],
      definitions,
    }),
  ).toEqual({
    command: "config",
    arguments: [],
    options: { "log-level": "debug", "config-file": "x", "log-dir": "y" },
  });
});
it("accepts an empty invocation", () => {
  expect(parseArguments({ args: [], definitions })).toEqual({
    command: "",
    options: {},
    arguments: [],
  });
});
it("parses version with JSON as global boolean options", () => {
  expect(parseArguments({ args: ["--version", "--json"], definitions })).toEqual({
    command: "",
    arguments: [],
    options: { version: true, json: true },
  });
});
it.each([["--unknown"], ["--log-dir"]])("translates parser failures %j", (args) => {
  expect(() => parseArguments({ args: [args], definitions })).toThrow("Invalid command arguments");
});
it("parses registration options and shell flags with positionals", () => {
  const command = {
    name: "sample",
    summary: "Sample",
    usage: "sample",
    operations: [],
    options: [{ name: "path", placeholder: "file", summary: "Path" }],
    run: async () => ({ text: "", json: {} }),
  };
  expect(
    parseArguments({
      args: ["--json", "sample", "read", "--path", "x", "--help"],
      definitions,
      commands: [command],
    }),
  ).toEqual({
    command: "sample",
    arguments: ["read"],
    options: { json: true, path: "x", help: true },
  });
});
it.each([
  ["--json", "help", "--unknown"],
  ["help", "--unknown", "--json"],
  ["--json", "--log-dir"],
  ["--json", "--log-dir", "-folder"],
  ["--json", "--help=value"],
])("publishes JSON options before rejecting %j", (...args) => {
  const publish = vi.fn<NonNullable<ArgumentInput["publish"]>>();
  expect(() => parseArguments({ args, definitions, publish })).toThrow("Invalid command arguments");
  expect(publish).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ json: true }));
});
it.each([["--log-dir", "--json"], ["--json=value"], ["--unknown", "--", "--json"]])(
  "does not publish a JSON flag from option values or positionals %j",
  (...args) => {
    const publish = vi.fn<NonNullable<ArgumentInput["publish"]>>();
    expect(() => parseArguments({ args, definitions, publish })).toThrow(
      "Invalid command arguments",
    );
    expect(publish).not.toHaveBeenCalledWith(expect.objectContaining({ json: true }));
  },
);
it.each(["-folder", "-"])("accepts explicit string values %s", (value) => {
  const parsed = parseArguments({ args: [`--log-dir=${value}`, "--", "--json"], definitions });
  expect(parsed).toEqual({ options: { "log-dir": value }, command: "--json", arguments: [] });
});
it("accepts a separate single dash as a string value", () => {
  expect(parseArguments({ args: ["--log-dir", "-"], definitions }).options).toEqual({
    "log-dir": "-",
  });
});
it.each(["toString", "constructor", "__proto__"])(
  "rejects undeclared inherited option %s",
  (name) => {
    expect(() => parseArguments({ args: ["help", `--${name}=value`], definitions })).toThrow(
      "Invalid command arguments",
    );
  },
);
