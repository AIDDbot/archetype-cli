import type { Command } from "../../shared/command.type.ts";
import type { Output } from "../../shared/output/output.contract.ts";
import type { HealthService } from "./health.type.ts";

export function createHealthCommand(
  services: Readonly<{ health: HealthService; output: Output }>,
): Command {
  return {
    name: "health",
    execute: () => services.output.write(`${JSON.stringify(services.health.read())}\n`),
  };
}
