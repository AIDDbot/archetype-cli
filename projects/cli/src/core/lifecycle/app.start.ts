import { createApp, type Application } from "./app.compose.ts";
import { platform } from "./platform.adapter.ts";
import { runPlatform, type Platform } from "./platform.run.ts";

export async function start(
  options: Application,
  runtime: Platform = platform,
): Promise<Application> {
  await runPlatform(runtime, options);
  return createApp(options);
}
