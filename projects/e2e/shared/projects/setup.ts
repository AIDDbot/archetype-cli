import { afterEach } from "vite-plus/test";
import { createCli } from "./cli.ts";

export function createCliSetup() {
  const helpers: Awaited<ReturnType<typeof createCli>>[] = [];
  afterEach(async () => {
    await Promise.all(helpers.splice(0).map((cli) => cli.dispose()));
  });
  return async () => {
    const cli = await createCli();
    helpers.push(cli);
    return cli;
  };
}
