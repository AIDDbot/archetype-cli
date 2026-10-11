export type HealthStatus = Readonly<{ status: "ok"; runs: number }>;
export type HealthData = Readonly<{ recordRun: () => void; countRuns: () => number }>;
export type HealthService = Readonly<{ start: () => void; read: () => HealthStatus }>;
