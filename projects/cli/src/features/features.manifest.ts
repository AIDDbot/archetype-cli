import { registerAbout } from "./about/about.routes.ts";
import { registerConfig } from "./config/config.routes.ts";
import type { Registration } from "#shared/output/command.contract.ts";

export const features: readonly Registration[] = [registerAbout, registerConfig];
