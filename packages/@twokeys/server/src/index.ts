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
import api from "./routes/api";
import Logger from "./util/logger";
import { DEFAULT_PORT } from "./util/constants";
import { Arguments } from "yargs";

const app = express();
const logger: Logger = new Logger({
	name: "server",
});

app.use(bodyParser.json());
app.use("/api", api);

const server = (port: number = DEFAULT_PORT, argv: Arguments) => {
	app.listen(port, () => {
		logger.info("Server now listenning on port " + port);
		logger.debug("PID: " + process.pid);
	});

	if (argv.hasOwnProperty("pid-file") && argv["pid-file"]) {
		logger.debug(`Writing pid file to ${argv["pid-file"]}...`);
		writeFile(argv["pid-file"], process.pid.toString(), (err) => {
			if (err) { logger.throw(err); }
			logger.info("PID file Written.");
		});
	}

};

// Error handler
app.use((err, req, res, next) => {
	logger.err(`An error was encountered on router ${req.originalUrl}`);
	logger.throw_noexit(err);
	next(err);
});

export default server;
export { app };
