export interface SettingSource {
  read(name: string): unknown;
}
export interface SettingRead<T> {
  name: string;
  fallback: T;
  parse(value: unknown): T;
}
export function createSettingReader(source: SettingSource) {
  return function readSetting<T>(setting: SettingRead<T>): T {
    const value = source.read(setting.name);
    const isMissing = value === undefined;
    if (isMissing) return setting.fallback;
    return setting.parse(value);
  };
}
