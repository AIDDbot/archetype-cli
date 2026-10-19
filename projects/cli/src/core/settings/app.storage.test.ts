import { expect, test, vi } from "vite-plus/test";
import { createConfigurationStorage } from "./app.storage.ts";

function fakeFiles() {
  return {
    read: vi.fn<(path: string) => Promise<string>>(),
    write: vi.fn<(path: string, content: string) => Promise<void>>(),
  };
}

test("storage reads a configuration object", async () => {
  const files = fakeFiles();
  files.read.mockResolvedValue('{"LOG_LEVEL":"warn"}');
  await expect(createConfigurationStorage(files).read("settings.json")).resolves.toEqual({
    LOG_LEVEL: "warn",
  });
  expect(files.read).toHaveBeenCalledWith("settings.json");
});

test("storage treats a missing file as an empty configuration", async () => {
  const files = fakeFiles();
  files.read.mockRejectedValue({ code: "ENOENT" });
  await expect(createConfigurationStorage(files).read("missing.json")).resolves.toEqual({});
});

test.each(["[]", "null", "invalid"])(
  "storage rejects invalid configuration %s",
  async (content) => {
    const files = fakeFiles();
    files.read.mockResolvedValue(content);
    await expect(createConfigurationStorage(files).read("settings.json")).rejects.toMatchObject({
      kind: "unavailable",
      message: "Cannot read configuration settings.json",
    });
  },
);

test.each([{ code: "EACCES" }, "failure"])("storage reports read failures %s", async (error) => {
  const files = fakeFiles();
  files.read.mockRejectedValue(error);
  await expect(createConfigurationStorage(files).read("settings.json")).rejects.toThrow(
    "Cannot read configuration",
  );
});

test("storage writes formatted configuration and reports write failures", async () => {
  const files = fakeFiles();
  const storage = createConfigurationStorage(files);
  await storage.write("settings.json", { LOG_LEVEL: "debug" });
  expect(files.write).toHaveBeenCalledWith("settings.json", '{\n  "LOG_LEVEL": "debug"\n}\n');
  files.write.mockRejectedValue(new Error("denied"));
  await expect(storage.write("settings.json", {})).rejects.toThrow("Cannot write configuration");
});
