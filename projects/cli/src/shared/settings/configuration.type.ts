export interface ConfigurationStorage {
  read(path: string): Promise<Record<string, unknown>>;
  write(path: string, values: Record<string, unknown>): Promise<void>;
}
