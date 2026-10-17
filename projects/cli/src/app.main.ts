#!/usr/bin/env node
import { startApp } from "./app.compose.ts";
process.exitCode = await startApp();
