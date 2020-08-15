/* eslint-disable */
// FILE COMPILED BY scripts/commands-list.ts
// DO NOT MODIFY

// Imports
import { Command } from "./common/base-commands";
import command0 from "./setup/commands/daemon"
import command1 from "./setup/commands/oobe"
import command2 from "./setup/commands/project"

// Map
export = new Map<string, Command<unknown>>([
	["generateProjectDaemon", command0],
	["oobe", command1],
	["createProject", command2],
]);
