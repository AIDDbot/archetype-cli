import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

type TemporaryStore = Readonly<{ directory: string; database: string }>;

export async function withTemporaryStore(
  operation: (store: TemporaryStore) => Promise<void>,
): Promise<void> {
  const directory = await mkdtemp(join(tmpdir(), "health-store-"));
  try {
    await operation({ directory, database: join(directory, "health.sqlite") });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}
