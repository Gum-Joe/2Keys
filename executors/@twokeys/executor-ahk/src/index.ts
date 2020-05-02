/**
 * Main executor for AHK
 * @packageDocumentation
 */
import type { Executor } from "@twokeys/addons/src/index";
import execute, { AHKExecutorConfig } from "./exec";
// @ts-ignore
const executor: Executor<AHKExecutorConfig> = {
	execute: execute,
};

export = executor;