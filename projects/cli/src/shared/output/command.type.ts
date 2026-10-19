import type { Settings } from "#shared/settings/settings.type.ts";
import type { View } from "./view.type.ts";
import type { Identity } from "#shared/identity.value.ts";
export interface CommandOption {
  name: string;
  placeholder?: string;
  summary: string;
  default?: string;
}
export type CommandResult = { data: object } & ({ view: View } | { text: string });
export interface FeatureContext {
  identity: Identity;
}
export interface CommandRegistration {
  name: string;
  summary: string;
  usage: string;
  operations: readonly { name: string; summary: string }[];
  options: readonly CommandOption[];
  run(args: string[], settings: Settings): Promise<CommandResult>;
}
