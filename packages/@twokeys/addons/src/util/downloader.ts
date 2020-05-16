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
 * Contains the class to download software
 * @packageDocumentation
 */
import { promises as fs, createWriteStream } from "fs";
import path from "path";
import { promisify } from "util";
import stream from "stream";
import mkdirp from "mkdirp";
import Axios from "axios";
import { Logger } from "@twokeys/core";
import { Software } from "./interfaces";

const pipeline = promisify(stream.pipeline);

/**
 * Defines the options for the downloader
 */
export interface DownloaderOptions {
	logger?: Logger;
	noForce?: boolean;
}

/**
 * Downloads a file and saves it.
 * Please note the default is to overwrite an existing download.
 */
export default class Downloader {
	protected logger: Logger;
	protected software: Software;
	protected options: DownloaderOptions;
	/** Path to save download to, INCLUDING filename */
	protected savePath: string; // thus.saveTo + fetch_file().this.saveAs
	/** Used at the end of log strings */
	protected downloaderName = "downloader";
	

	/**
	 * Constructor
	 * @param software software object to download from {@link Software.url}. Please note URLs are HTTPS only
	 * @param savePath Path, including filename, to save to
	 * @param options Options
	 */
	constructor(software: Software, savePath: string, options: DownloaderOptions = {}) {
		this.software = software;
		this.logger = Object.prototype.hasOwnProperty.call(options, "logger") ? Object.assign(new Logger({ name: this.downloaderName }), options.logger) : new Logger({ name: this.downloaderName });
		this.logger.args.name = this.logger.args.name + ":" + this.downloaderName;
		this.savePath = savePath; // Save full path
		this.options = options;
	}

	/**
	 * Download the file
	 */
	public async download(): Promise<void> {
		this.logger.info(`Downloading package from url ${this.software.url} to ${this.savePath}`);
		// Make dirs
		this.logger.debug("Creating diractories...");
		try {
			await mkdirp(path.dirname(this.savePath));
		} catch (err) {
			this.logger.err("Error creating directory to save to!");
			throw err;
		}
		// Download
		this.logger.info("Downloading...");
		const { data, headers } = await Axios({
			url: this.software.url,
			method: "GET",
			responseType: "stream"
		});
		const totalLength = headers["content-length"];
		//const req = got.stream(this.software.url);
		if (!this.logger.isSilent) {
			this.logger.debug("Creating progress bar...");
			const progressBar = this.logger.createProgressBar(":bar :percent ETA: :etas", {
				complete: "▓",
				incomplete: "░",
				width: 50,
				total: totalLength ? parseInt(totalLength) : 6403580,
			});
			this.logger.debug("Adding progres...");
			data.on("data", (chunk) => {
				progressBar.tick(chunk.length);
			});
		}
		this.logger.debug("Piping output...");
		try {
			// DEW IT
			const writeStream = createWriteStream(this.savePath, {
				flags: this.options.noForce ? "wx" : "w", // Overwrite unless not allowed to force
			});
			await pipeline(
				data,
				writeStream
			);
			writeStream.close();
			this.logger.info("Download complete.");
			return;
		} catch (err) {
			if (err.code === "EEXIST") {
				this.logger.err(`${this.software.name} already downloaded.  Please delete the downloaded file if you need to redownload it.`);
				throw new Error(`${this.software.name} already downloaded.  Please delete the downloaded file if you need to redownload it.`);
			} else {
				this.logger.err("Error opening file to save to!");
				this.logger.err(err.message);
				throw err;
			}
		}
	}
}
