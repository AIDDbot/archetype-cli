import type { TestProject } from "vitest/node";
import { readCliSettings } from "./settings.read.ts";

export default function setup(project: TestProject): void {
  project.provide("cliSettings", readCliSettings(process.env));
}
