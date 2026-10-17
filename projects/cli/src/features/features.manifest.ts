import { registerConfig } from "./config/config.command.ts";
import { registerAbout } from "./about/about.command.ts";
export const features = [registerConfig, registerAbout] as const;
