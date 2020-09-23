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
import { Arguments } from "yargs";
import mkdirp from "mkdirp";
import { WINDOWS_DAEMON_PREFIX, DEFAULT_LOCAL_2KEYS, WINDOWS_DAEMON_FILE, WINDOWS_DAEMON_PID_FILE, WINDOWS_DAEMON_FILE_JS_TEMPLATE, WINDOWS_DAEMON_FILE_VBS_TEMPLATE, WINDOWS_DAEMON_FILE_VBS, WINDOWS_SERVER_PID_FILE } from "../util/constants";
import Logger from "../util/logger";
import { writeFileSync, readFile, symlinkSync, readFileSync, promises as fsPromises } from "fs";
import { exec } from "child_process";
import { homedir } from "os";
import { config_loader } from "../util/config";


const Mustache = require("mustache");

const logger = new Logger({
	name: "startup"
});

/**
 * Hacky way to generate daemon startup JS
 * @param name Name of 2Keys project, from config
 */
function gen_startup_js(name: string): string {
	const output = Mustache.render(readFileSync(WINDOWS_DAEMON_FILE_JS_TEMPLATE).toString("utf8"), {
		root: process.cwd().split("\\").join("\\\\"),
		name,
		default_local_twokeys: DEFAULT_LOCAL_2KEYS,
		daemon_pid_file: WINDOWS_DAEMON_PID_FILE,
		server_pid_file: WINDOWS_SERVER_PID_FILE
	});
	return output;
}

/**
 * Generates .vbs startup script for shell:startup
 */
function gen_startup_vbs(name: string): string {
	const output = Mustache.render(readFileSync(WINDOWS_DAEMON_FILE_VBS_TEMPLATE).toString("utf8"), {
		daemon: join(process.cwd(), DEFAULT_LOCAL_2KEYS, WINDOWS_DAEMON_FILE),
		name,
	});
	return output;
}

/**
 * Stop 2Keys daemon
 */
export function stop_daemon(): Promise<void> {
	return new Promise((resolve) => {
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
}

/**
 * Starts 2Keys daemon
 */
export function start_daemon(): void {
	logger.info("Starting 2Keys daemon...");
	logger.info(`See logs in ${join(process.cwd(), DEFAULT_LOCAL_2KEYS)} for logs.`);
	exec(join(process.cwd(), DEFAULT_LOCAL_2KEYS, WINDOWS_DAEMON_FILE_VBS), {}, (error) => {
		if (error) {
			logger.throw(error);
		}
		logger.info("2Keys daemon now running.");
	});
}

/**
 * Function to regenerate daemons
 * @param argv CLI args
 */
export async function regenerateDaemons(argv: Arguments): Promise<void> {
	logger.info("Regenerating daemon files...");
	logger.warn("Deleting old files...");
	try {
		await fsPromises.unlink(join(process.cwd(), DEFAULT_LOCAL_2KEYS, WINDOWS_DAEMON_FILE)); // JS
		await fsPromises.unlink(join(process.cwd(), DEFAULT_LOCAL_2KEYS, WINDOWS_DAEMON_FILE_VBS)); // VBS Script; Startup script not deleted

		logger.debug("Grabbing config...");
		const config = await config_loader();

		logger.debug("Running generator...");
		// eslint-disable-next-line @typescript-eslint/no-use-before-define
		add_to_startup(config.name, argv);
	} catch (err) {
		logger.throw(err);
	}
}

/**
 * Creates a new daemon
 * Creates a daemon starter js file in root/.2Keys/daemon.js
 * A daemon Visual Basic startup script in shell:startup/2Keys-name.vbs
 * And symlinks the .vbs for the start, stop and restart commands
 * @param name Name of 2Keys project, from config
 */
export default function add_to_startup(name: string, argv: Arguments): void {
	logger.debug("Making files...");
	// Create required dirs
	try {
		mkdirp.sync(join(process.cwd(), DEFAULT_LOCAL_2KEYS));
		logger.debug(`Made dir ${join(process.cwd(), DEFAULT_LOCAL_2KEYS)}...`);
	} catch (err) {
		logger.throw(err);
	}
	// NOTE: Even though there may not be a "Startup" folder, windows explorer may show a "Start-Up" folder
	// 2Keys will still see "Startup"
	const VBS_SCRIPT = join(homedir(), "AppData", "Roaming", "Microsoft", "Windows", "Start Menu", "Programs", "Startup", `${WINDOWS_DAEMON_PREFIX}${name}.vbs`);
	// Create service file
	try {
		logger.debug(`Creating daemon startup js file to start the server as ${WINDOWS_DAEMON_PREFIX}${name}...`);
		writeFileSync(join(process.cwd(), DEFAULT_LOCAL_2KEYS, WINDOWS_DAEMON_FILE), gen_startup_js(name));

		logger.debug("Adding a .vbs script to .2Keys to start daemon in the background...");
		// writeFileSync(join(process.env.APPDATA, "Microsoft", "Windows", "Start Menu", "Programs", "Startup", `${WINDOWS_DAEMON_PREFIX}${name}.vbs`), gen_startup_vbs());
		writeFileSync(join(process.cwd(), DEFAULT_LOCAL_2KEYS, WINDOWS_DAEMON_FILE_VBS), gen_startup_vbs(name));

		if (!Object.prototype.hasOwnProperty.call(argv, "startup")) { // If --no-startup given, startup set to false.  Is undefined if not
			logger.debug("Symlinking this .vbs script into user startup folder...");
			symlinkSync(join(process.cwd(), DEFAULT_LOCAL_2KEYS, WINDOWS_DAEMON_FILE_VBS), VBS_SCRIPT);
		}
	} catch (err) {
		if (err.code === "EEXIST") {
			// Writing auto removes file, so only symlink could throw EEXIST
			logger.warn("Symbolink already created, it still points at the correct place, but we can't replace it.");
			logger.debug("Full error that caused this warning: ");
			logger.debug(err.stack);
		} else {
			logger.throw(err);
		}
	}
}
