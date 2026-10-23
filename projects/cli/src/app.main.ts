#!/usr/bin/env node
import { start } from "#core/lifecycle/app.start.ts";
import { features } from "./features/features.manifest.ts";
import identity from "#package" with { type: "json" };

await start({ features, identity });
