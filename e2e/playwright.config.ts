import { defineConfig } from "@playwright/test";
import { suiteSettings } from "./core/suite.config.ts";

export default defineConfig(suiteSettings);
