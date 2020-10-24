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
 * Create Project config
 * @packageDocumentation
 */
import { join } from "path";
import mkdirp from "mkdirp";
import { promises as fs } from "fs";
import { CreateProject } from "../protobuf/project_pb";
import { CommandFactory, PromiseCommand } from "../../common";
import * as errorCodes from "../util/errors";
import packageJSON from "../../../package.json";
import generateDaemon from "./daemon";
import { stringifyProjectConfig } from "@twokeys/core/lib/config";
import { TWOKEYS_PROJECT_CONFIG_FILENAME } from "@twokeys/core/lib/constants";
import { ProjectConfig } from "@twokeys/core/lib/interfaces";
import { CodedError } from "@twokeys/core";
import { DEFAULT_LOCAL_2KEYS } from "../util/constants";

export const TWOKEYS_CONFIG_PRELUDE = `# 2Keys Project Config
# FILE AUTOGENERATED BY 2KEYS
# DO NOT MODIFY DIRECTLY,
# UNLESS YOU KNOW WHAT YOU ARE DOING
#
# USE THE GUI FOR MODIFICATIONS PREFERABLY
#
# Help text will eventually go here
# Note: all comments will be lost upon writing to this config with the GUI
`;

/**
 * Create a new project, creating the folder and the config file for it
 * 
 * NOTE: {@link CreateProject.AsObject.serverInfo.permissions} needs to be provided
 */
const createProject: PromiseCommand<Required<CreateProject.AsObject>> = async (twokeys, config) => {
	const { logger } = twokeys;
	logger.status("Creating new project");
	logger.substatus("Creating config");
	logger.info("Validating info...");
	if (typeof config.serverInfo === "undefined") {
		throw new CodedError("Did not get any server info!", errorCodes.MISSING_PROPS);
	}
	if (typeof config.permissions === "undefined") {
		throw new CodedError("Did not get any permissions info!", errorCodes.MISSING_PROPS);
	}
	if (typeof config.serverInfo.permissions === "undefined") {
		throw new CodedError("Did not get any permissions info for server!", errorCodes.MISSING_PROPS);
	}

	const configToWrite: ProjectConfig = {
		name: config.projectName,
		id: config.projectUuid,
		version: packageJSON.version,
		server: {
			port: config.serverInfo.serverPort,
			perms: {
				startOnStartup: config.serverInfo.permissions.allowStartup,
			}
		},
		detectors: [],
		// TODO: Update this to use config once sync is enabled.
		perms: {
			sync: false,
		}
	};

	logger.info("Creating project dir....");
	await mkdirp(config.projectLocation);
	logger.info("Writing config...");
	await fs.writeFile(join(config.projectLocation, TWOKEYS_PROJECT_CONFIG_FILENAME), TWOKEYS_CONFIG_PRELUDE + "\n" + stringifyProjectConfig(configToWrite));
	logger.info("Done");

	await generateDaemon(twokeys, {
		projectLocation: config.projectLocation,
		// TODO: One day, allow this to be customised
		relativeFilesLocationDir: DEFAULT_LOCAL_2KEYS,
		addToStartup: config.serverInfo.permissions.allowStartup ? true : false,
	});
	// TODO: Add project to index

};

export default CommandFactory.wrapCommand(createProject, "createProject");