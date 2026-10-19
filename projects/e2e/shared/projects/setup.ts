import { afterEach } from "vite-plus/test";
import { createCli, type Cli } from "./cli.ts";

export function createCliSetup(): () => Promise<Cli> {
  const helpers: Cli[] = [];
  afterEach(async () => {
    await Promise.all(helpers.splice(0).map((cli) => cli.dispose()));
  });
  return async () => {
    const cli = await createCli();
    helpers.push(cli);
    return cli;
  };
}
