import type { Command } from "../shared/command.type.ts";
import type { Database } from "../shared/database/database.contract.ts";
import type { Output } from "../shared/output/output.contract.ts";
import { registerHealth } from "./health/health.registration.ts";

export type Services = Readonly<{ database: Database; output: Output }>;

export function registerFeatures(services: Services): readonly Command[] {
  return [registerHealth(services)];
}
