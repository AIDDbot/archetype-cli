import { startShell } from "./core/shell.ts";
import { registerFeatures } from "./features/features.manifest.ts";
import { readConfiguration } from "./core/app.config.ts";
import { withDatabase } from "./core/app.database.ts";
import { readVersion } from "./core/app.version.ts";

export function startApplication(argumentsList = process.argv.slice(2)): void {
  const configuration = readConfiguration(argumentsList, process.env);
  withDatabase(configuration.databasePath, (database) => {
    const features = registerFeatures({
      database,
      output: {
        write: (text) => {
          process.stdout.write(text);
        },
      },
    });
    if (configuration.isVersion) {
      process.stdout.write(`${readVersion()}\n`);
      return;
    }
    startShell(features, configuration.arguments);
  });
}
