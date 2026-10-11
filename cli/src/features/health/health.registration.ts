import type { Database } from "../../shared/database/database.contract.ts";
import type { Output } from "../../shared/output/output.contract.ts";
import type { Command } from "../../shared/command.type.ts";
import { createHealthRepository } from "./health.repository.ts";
import { createHealthService } from "./health.service.ts";
import { createHealthCommand } from "./health.command.ts";

export function registerHealth(
  services: Readonly<{ database: Database; output: Output }>,
): Command {
  const health = createHealthService(createHealthRepository(services.database));
  health.start();
  return createHealthCommand({ health, output: services.output });
}
