import type { HealthData, HealthService } from "./health.type.ts";

export function createHealthService(data: HealthData): HealthService {
  return {
    start: () => data.recordRun(),
    read: () => ({ status: "ok", runs: data.countRuns() }),
  };
}
