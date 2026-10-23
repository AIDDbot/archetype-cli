import type { Identity } from "#shared/identity.type.ts";
import type { Settings } from "#shared/settings/settings.contract.ts";
import type { OutputView } from "./view.contract.ts";

export type CommandOption = {
  name: string;
  placeholder: string;
  summary: string;
  default?: string;
};
export type CommandOperation = { name: string; summary: string; arguments?: readonly string[] };
export type CommandResult = { text: string; json: Readonly<Record<string, unknown>> } | OutputView;
export type CommandInput = {
  arguments: readonly string[];
  options: Readonly<Record<string, unknown>>;
};
export type Command = {
  name: string;
  summary: string;
  usage: string;
  operations: readonly CommandOperation[];
  options: readonly CommandOption[];
  run: (input: CommandInput) => Promise<CommandResult>;
};
export type RegistrationInput = { identity: Identity; settings: Settings };
export type Registration = (input: RegistrationInput) => readonly Command[];
