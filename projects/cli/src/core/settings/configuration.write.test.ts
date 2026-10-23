import { expect, it, vi } from "vitest";
import { writeConfiguration, type ConfigurationStorage } from "./configuration.write.ts";

function fixture() {
  const files = new Map([["config.json", "original"]]);
  const storage: ConfigurationStorage = {
    temporary: (file) => `${file}.unique.tmp`,
    write: vi.fn<ConfigurationStorage["write"]>(async (file, text) => {
      files.set(file, text);
    }),
    replace: vi.fn<ConfigurationStorage["replace"]>(async (temporary, file) => {
      expect(files.get(file)).toBe("original");
      expect(files.get(temporary)).toBe("complete");
      files.set(file, "complete");
      files.delete(temporary);
    }),
    remove: vi.fn<ConfigurationStorage["remove"]>(async (file) => {
      files.delete(file);
    }),
  };
  const save = () => writeConfiguration(storage, { file: "config.json", text: "complete" });
  return { files, storage, save };
}

it("replaces the original only after the complete sibling write", async () => {
  const { files, storage, save } = fixture();
  await save();
  expect(storage.write).toHaveBeenCalledExactlyOnceWith("config.json.unique.tmp", "complete");
  expect(storage.replace).toHaveBeenCalledExactlyOnceWith("config.json.unique.tmp", "config.json");
  expect(storage.remove).toHaveBeenCalledExactlyOnceWith("config.json.unique.tmp");
  expect([...files]).toEqual([["config.json", "complete"]]);
});

it("preserves the original and removes a partial temporary write", async () => {
  const { files, storage, save } = fixture();
  const failure = Error("disk full");
  vi.mocked(storage.write).mockImplementationOnce(async (file) => {
    files.set(file, "partial");
    throw failure;
  });
  await expect(save()).rejects.toBe(failure);
  expect(storage.replace).not.toHaveBeenCalled();
  expect([...files]).toEqual([["config.json", "original"]]);
});

it("preserves the original and removes the sibling when replacement fails", async () => {
  const { files, storage, save } = fixture();
  const failure = Error("replacement denied");
  vi.mocked(storage.replace).mockRejectedValueOnce(failure);
  await expect(save()).rejects.toBe(failure);
  expect([...files]).toEqual([["config.json", "original"]]);
});

it("keeps the persistence failure when temporary cleanup also fails", async () => {
  const { files, storage, save } = fixture();
  const failure = Error("write denied");
  vi.mocked(storage.write).mockRejectedValueOnce(failure);
  vi.mocked(storage.remove).mockRejectedValueOnce(Error("cleanup denied"));
  await expect(save()).rejects.toBe(failure);
  expect(files.get("config.json")).toBe("original");
});

it("keeps a successful replacement when cleanup fails", async () => {
  const { files, storage, save } = fixture();
  vi.mocked(storage.remove).mockRejectedValueOnce(Error("cleanup denied"));
  await expect(save()).resolves.toBeUndefined();
  expect([...files]).toEqual([["config.json", "complete"]]);
});
