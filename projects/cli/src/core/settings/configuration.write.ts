export type ConfigurationStorage = {
  temporary: (file: string) => string;
  write: (file: string, text: string) => Promise<void>;
  replace: (temporary: string, file: string) => Promise<void>;
  remove: (file: string) => Promise<void>;
};
export type ConfigurationContent = { file: string; text: string };

function ignoreCleanupFailure(): void {}

export async function writeConfiguration(
  storage: ConfigurationStorage,
  content: ConfigurationContent,
): Promise<void> {
  const temporary = storage.temporary(content.file);
  try {
    await storage.write(temporary, content.text);
    await storage.replace(temporary, content.file);
  } finally {
    await storage.remove(temporary).catch(ignoreCleanupFailure);
  }
}
