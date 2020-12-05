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
 * Server starter for 2Keys
 * @packageDocumentation
 */
import express from "express";
import bodyParser from "body-parser";
import { writeFile } from "fs";
import { DEFAULT_LOCAL_2KEYS, DEFAULT_PORT, WINDOWS_SERVER_PID_FILE } from "./util/constants";
import { Arguments } from "yargs";
import { loadProjectConfig } from "@twokeys/core/lib/config";
import { join } from "path";
import getAPI from "./routes/api";
import { ProjectConfig } from "@twokeys/core/lib/interfaces";
import helmet from "helmet";
import mkdirp from "mkdirp";
import startupScripts from "./util/startup";
import { Logger } from "@twokeys/core";

const app = express();
const logger: Logger = new Logger({
	name: "server",
});

interface ServerArgs {
	"pid-file"?: string;
}

const server = async (port: number = DEFAULT_PORT, argv: ServerArgs, projectDir: string, projectConfig: ProjectConfig): Promise<ReturnType<typeof express>> => {

	// Default start scripts
	await startupScripts();

	app.use(bodyParser.json());
	app.use(helmet());
	app.use("/api", await getAPI(projectConfig, projectDir));

	// Error handler
	app.use((err, req, res, next) => {
		logger.err(`An error was encountered on router ${req.originalUrl}`);
		logger.printError(err);
		next(err);
	});

	app.listen(port, () => {
		logger.info("Server now listenning on port " + port);
		logger.debug("PID: " + process.pid);
	});

	// FIXME: Currently ignored argv and just uses projectDir.
	if (Object.prototype.hasOwnProperty.call(argv, "pid-file") && typeof argv["pid-file"] === "string" && argv["pid-file"]) {
		logger.debug(`Writing pid file to ${join(projectDir, DEFAULT_LOCAL_2KEYS, WINDOWS_SERVER_PID_FILE)}...`);
		mkdirp(join(projectDir, DEFAULT_LOCAL_2KEYS));
		writeFile(join(projectDir, DEFAULT_LOCAL_2KEYS, WINDOWS_SERVER_PID_FILE), process.pid.toString(), (err) => {
			if (err) { logger.printError(err); }
			logger.info("PID file Written.");
		});
	}

	return app;

};

/**
 * Eventually default starter for server
 * @param projectDir Absoluter path to project
 */
export async function starter(projectDir: string): Promise<void> {
	logger.info("Starting 2Keys....");
	logger.info("Loading project...");
	// TODO: Version checks to check config version matches this version of 2Keys
	const projectConfig = await loadProjectConfig(projectDir);
	await server(projectConfig.server.port, {
		"pid-file": join(projectDir, DEFAULT_LOCAL_2KEYS, WINDOWS_SERVER_PID_FILE)
	} as Arguments<ServerArgs>, projectDir, projectConfig);
}

export default server;
export { app };
