#!/usr/bin/env node
import { startApplication } from "./app.compose.ts";
import { runSafely } from "./core/app.errors.ts";

runSafely(startApplication);
