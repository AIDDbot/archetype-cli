import type { Command, RegistrationInput } from "#shared/output/command.contract.ts";
import { aboutResult } from "./about.command.ts";

export function registerAbout(input: RegistrationInput): readonly Command[] {
  return [
    {
      name: "about",
      summary: "Show application identity and project technology",
      usage: "about",
      operations: [],
      options: [],
      run: async () => aboutResult(input.identity),
    },
  ];
}
