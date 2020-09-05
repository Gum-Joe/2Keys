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
 * Adds the hotkeys server to windows startup
 * @packageDocumentation
 */
import { join } from "path";
import mkdirp from "mkdirp";
import {
	WINDOWS_DAEMON_PREFIX,
	DEFAULT_LOCAL_2KEYS,
	WINDOWS_DAEMON_FILE,
	WINDOWS_DAEMON_PID_FILE,
	WINDOWS_DAEMON_FILE_JS_TEMPLATE,
	WINDOWS_DAEMON_FILE_VBS_TEMPLATE,
	WINDOWS_DAEMON_FILE_VBS,
	WINDOWS_SERVER_PID_FILE } from "../util/constants";
import { promises as fs } from "fs";
import { Command, CommandFactory, PromiseCommand } from "../../common";
import { GenerateProjectDaemon } from "../protobuf/daemon_pb";
import { CodedError } from "@twokeys/core";
import * as errorCodes from "../../util/errors";
import { loadProjectConfig } from "@twokeys/core/lib/config";
import native from "../util/native";


const Mustache = require("mustache");

// TODO: Figure out how templates are handled

/**
 * Hacky way to generate daemon startup JS
 * @param name Name of 2Keys project, from config
 * @param relativeDir relative .2Keys dir where stuff is
 * @param projectRoot Aboslute path to project root
 * TODO: Only supports windows at the moment
 */
async function gen_startup_js(name: string, relativeDir: string = DEFAULT_LOCAL_2KEYS, projectRoot: string): Promise<string> {
	const output = Mustache.render((await fs.readFile(WINDOWS_DAEMON_FILE_JS_TEMPLATE)).toString("utf8"), {
		root: projectRoot.split("\\").join("\\\\"),
		name,
		default_local_twokeys: relativeDir,
		daemon_pid_file: WINDOWS_DAEMON_PID_FILE,
		server_pid_file: WINDOWS_SERVER_PID_FILE
	});
	return output;
}

/**
 * Generates .vbs startup script for shell:startup
 * @param filesDir absolute path to .2Keys dir where stuff is
 */
async function gen_startup_vbs(name: string, filesDir: string): Promise<string> {
	const output = Mustache.render((await fs.readFile(WINDOWS_DAEMON_FILE_VBS_TEMPLATE)).toString("utf8"), {
		daemon: join(filesDir, WINDOWS_DAEMON_FILE),
		name,
	});
	return output;
}

const generateDaemon: PromiseCommand<GenerateProjectDaemon.AsObject, void> = async function (twokeys, config) {
	const { logger } = twokeys;
	logger.status("Generating files for startup");
	logger.substatus("Validating project");
	if (typeof config.projectLocation === "undefined") {
		throw new CodedError("Project to use not specificed.", errorCodes.PROJECT_DIR_MISSING);
	}
	if (typeof config.relativeFilesLocationDir === "undefined") {
		config.relativeFilesLocationDir = DEFAULT_LOCAL_2KEYS;
	}
	// Check is project
	const projectConf = await loadProjectConfig(config.projectLocation);
	const projectName = projectConf.name;
	logger.info(`Using dir ${config.relativeFilesLocationDir} in project for daemon files.`);
	// Create required dirs
	await mkdirp(join(config.projectLocation, config.relativeFilesLocationDir));
	logger.debug(`Made dir ${join(config.projectLocation, config.relativeFilesLocationDir)}...`);
	// Create service file
	try {
		logger.info(`Creating daemon startup js file to start the server as file ${WINDOWS_DAEMON_PREFIX}${projectName}...`);
		await fs.writeFile(
			join(config.projectLocation, config.relativeFilesLocationDir, WINDOWS_DAEMON_FILE),
			await gen_startup_js(projectName, config.relativeFilesLocationDir, config.projectLocation)
		);

		logger.info("Adding a .vbs script to .2Keys to start daemon in the background...");
		// writeFileSync(join(process.env.APPDATA, "Microsoft", "Windows", "Start Menu", "Programs", "Startup", `${WINDOWS_DAEMON_PREFIX}${projectName}.vbs`), gen_startup_vbs());
		await fs.writeFile(
			join(config.projectLocation, config.relativeFilesLocationDir, WINDOWS_DAEMON_FILE_VBS),
			await gen_startup_vbs(projectName, join(config.projectLocation, config.relativeFilesLocationDir))
		);

		if (config.addToStartup) { // If --no-startup given, startup set to false.  Is undefined if not
			// NOTE: Even though there may not be a "Startup" folder, windows explorer may show a "Start-Up" folder
			// 2Keys will still see "Startup"
			let VBS_SCRIPT_SYMBLINK: string;
			try {
				VBS_SCRIPT_SYMBLINK = join(native.get_startup_folder(), `${WINDOWS_DAEMON_PREFIX}${projectName}.vbs`);
				logger.info("Symlinking this .vbs script into user startup folder...");
				logger.debug(`Linking into ${VBS_SCRIPT_SYMBLINK}`);
				await fs.symlink(join(config.projectLocation, config.relativeFilesLocationDir, WINDOWS_DAEMON_FILE_VBS), VBS_SCRIPT_SYMBLINK);
			} catch (err) {
				if (typeof err.code !== "undefined") {
					throw err;
				} else {
					logger.warn("Not symolically linking the .vbs script as the startup folder was not found, or a generic error was encountered");
					logger.warn(`Full error: ${err.message}`);
				}
			}
		}
	} catch (err) {
		if (err.code === "EEXIST") {
			// Writing auto removes file, so only symlink could throw EEXIST
			logger.warn("Symbolink already created, it should point at the correct place, but we can't replace it.");
			logger.debug("Full error that caused this warning: ");
			logger.debug(err.message);
		} else {
			throw err;
		}
	}
};

export default CommandFactory.wrapCommand(generateDaemon, "generateProjectDaemon");

/**
 * Stop 2Keys daemon
 */
/*export function stop_daemon() {
	return new Promise((resolve, reject) => {
		logger.info("Stopping 2Keys startup daemon...");
		logger.info("NB: You may need to run 2Keys daemon-gen to make sure you have the latest daemon files.");
		logger.debug("Reading .pid files...");
		readFile(join(process.cwd(), DEFAULT_LOCAL_2KEYS, WINDOWS_SERVER_PID_FILE), (err, pid) => {
			if (err) logger.throw(err);
			logger.debug(`Server PID: ${pid.toString()}`);
			logger.debug("Killing...");
			process.kill(parseInt(pid.toString()), "SIGINT");
			readFile(join(process.cwd(), DEFAULT_LOCAL_2KEYS, WINDOWS_DAEMON_PID_FILE), (err2, pid2) => {
				if (err2) logger.throw(err2);
				logger.debug(`Daemon PID: ${pid2.toString()}`);
				logger.debug("Killing...");
				process.kill(parseInt(pid2.toString()));
				resolve();
			});
		});
	});
}*/

/**
 * Starts 2Keys daemon
 */
/*export function start_daemon() {
	logger.info("Starting 2Keys daemon...");
	logger.info(`See logs in ${join(process.cwd(), DEFAULT_LOCAL_2KEYS)} for logs.`);
	exec(join(process.cwd(), DEFAULT_LOCAL_2KEYS, WINDOWS_DAEMON_FILE_VBS), {}, (error, stdout, stderr) => {
		if (error) {
			logger.throw(error);
		}
		logger.info("2Keys daemon now running.");
	});
}*/

/**
 * Function to regenerate daemons
 * @param argv CLI args
 */
/*export async function regenerateDaemons(argv: Arguments) {
	logger.info("Regenerating daemon files...");
	logger.warn("Deleting old files...");
	try {
		await fsPromises.unlink(join(process.cwd(), DEFAULT_LOCAL_2KEYS, WINDOWS_DAEMON_FILE)); // JS
		await fsPromises.unlink(join(process.cwd(), DEFAULT_LOCAL_2KEYS, WINDOWS_DAEMON_FILE_VBS)); // VBS Script; Startup script not deleted

		logger.debug("Grabbing config...");
		const config = await config_loader();

		logger.debug("Running generator...");
		add_to_startup(config.name, argv);
	} catch (err) {
		logger.throw(err);
	}
}*/
