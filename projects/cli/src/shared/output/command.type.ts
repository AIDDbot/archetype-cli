import type { Settings } from "../settings/settings.type.ts";
import type { View } from "./view.type.ts";
export interface CommandOption {
  name: string;
  placeholder?: string;
  summary: string;
  default?: string;
}
export type CommandResult = { data: object } & ({ view: View } | { text: string });
export interface CommandRegistration {
  name: string;
  summary: string;
  usage: string;
  operations: readonly { name: string; summary: string }[];
  options: readonly CommandOption[];
  run(args: string[], settings: Settings): Promise<CommandResult>;
}
