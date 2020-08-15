/**
 * @license
 * Copyright 2020 Kishan Sambhi
 *
 * This file is part of 2Keys.
 *
 * 2Keys is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * 2Keys is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with 2Keys.  If not, see <https://www.gnu.org/licenses/>.
 */
/**
 * Creates commands index
 * NOTE: Vulnerable to code injection.  ONLY USE ON OUR CODE.
 * @packageDocumentation
 */
import commands from "../commands.json";
import globby from "globby";
import { Logger } from "@twokeys/core";
import { checkCommandInfo } from "../src/common/is-command";
import { Command } from "../src/common/base-commands";
import path, { join, relative, basename, dirname } from "path";
import { promises as fs } from "fs";

const OUT_FILE = join(__dirname, "../src/commandsList.ts");

const logger = new Logger({
	name: "build",
});

interface MappedCommand {
	commandName: string;
	/** Abs path to file */
	file: string;
}

type CommandsMap = Map<string, string>;

(async () => {
	logger.info("Generating commands index...");
	const paths = await globby(commands.commands);

	const commandsMap: CommandsMap = new Map();

	paths.forEach((theFile) => {
		const command = require(join(process.cwd(), theFile)).default;
		try {
			checkCommandInfo(command);
		} catch (err) {
			logger.warn(`${theFile}'s default export is not a command`);
			return {};
		}
		checkCommandInfo(command);
		logger.info(`Adding ${theFile}, command ${command.commandInfo.commandName}`);
		if (commandsMap.has(command.commandInfo.commandName)) {
			throw new Error(`Conflict between ${theFile} and ${commandsMap.get(command.commandInfo.commandName)}! Both want to use command name ${command.commandInfo.commandName}!`);
		}
		commandsMap.set(command.commandInfo.commandName, join(process.cwd(), theFile));
	});

	const mappedCommands: MappedCommand[] = [];
	// Convert to array for easier dealing
	for (const [commandName, file] of commandsMap) {
		mappedCommands.push({
			commandName,
			file,
		});
	}

	// Now, loop
	const finalFile = `/* eslint-disable */
// FILE COMPILED BY scripts/commands-list.ts
// DO NOT MODIFY

// Imports
${mappedCommands.map((command, index) => {
	const relativeFilePath = relative(dirname(OUT_FILE), command.file);
	const filePathWithoutExt = join(path.parse(relativeFilePath).dir, path.parse(relativeFilePath).name);
	return `import command${index} from "./${filePathWithoutExt.split(path.sep).join("/")}"`;
}).join("\n")}

// Map
export = {
	${mappedCommands.map((command, index) => {
		return `"${command.commandName}": command${index},`;
	}).join("\n")}
}
`;
	await fs.writeFile(OUT_FILE, finalFile);
	logger.info("File written.");
})().catch(err => logger.printError(err));