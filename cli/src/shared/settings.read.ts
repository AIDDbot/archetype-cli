type Setting<T> = Readonly<{ name: string; fallback: string; parse: (value: string) => T }>;

export function readSetting<T>(setting: Setting<T>, environment: NodeJS.ProcessEnv): T {
  return setting.parse(environment[setting.name] ?? setting.fallback);
}
