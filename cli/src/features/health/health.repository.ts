import type { Database } from "../../shared/database/database.contract.ts";
import type { HealthData } from "./health.type.ts";

const recordRun = "INSERT INTO runs DEFAULT VALUES";
const countRuns = "SELECT count(*) AS runs FROM runs";

export function createHealthRepository(database: Database): HealthData {
  return {
    recordRun: () => {
      database.prepare(recordRun).run();
    },
    countRuns: () => Number(database.prepare(countRuns).get()?.runs),
  };
}
