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
 * ZIP file downloader, extracter and copier
 * @packageDocumentation
 */
import fs, { open as openRaw, createWriteStream, write as writer, close as closeFile, appendFile, promises, read } from "fs";
import https from "https";
import mkdirp from "mkdirp";
import ProgressBar from "progress";
import { Arguments } from "yargs";
import Logger from "../../util/logger";
import { join } from "path";
import AdmZip from "adm-zip";

const { open, access } = promises;


export default class ZipDownloader {
	private logger: Logger;
	private fullPath: string; // thus.saveTo + fetch_file().this.saveAs

	public argv: Arguments;
	public url: string;
	public name: string;
	public saveTo: string;
	public saveAs: string;

	/**
	 * Constructor
	 * @param name Name of software downloading, as referenced in userspace_config.software
	 * @param url URL to download the zip from (ONLY accepts HTTPS)
	 * @param saveTo Dir to save file to
	 * @param saveAs Filename to save as (including the .zip prefix)
	 */
	constructor(name: string, url: string, saveTo: string, saveAs: string, argv?: Arguments) {
		this.name = name;
		this.logger = new Logger({
			name,
		});
		this.url = url;
		this.saveTo = saveTo;
		this.saveAs = saveAs;
		this.argv = typeof argv === "object" ? argv : {};

		this.fullPath = join(this.saveTo, this.saveAs); // Save full path
	}

	/**
	 * Download the file
	 */
	public fetch_file(): Promise<void> {
		return new Promise(async (resolve, reject) => {
			this.logger.info(`Downloading package from url ${this.url} to ${this.saveTo} as ${this.saveAs}.zip...`);

			// Make dirs
			try { await mkdirp(this.saveTo); } catch (err) {
				this.logger.err("Error making download dirs!");
				reject(err);
				return;
			}
			this.logger.debug("Created dirs.");

			// See if exists
			// Only needed if not forcing
			if (!this.argv.force) {
				try {
					await open(this.fullPath, "wx");
				} catch (err) {
					if (err.code === "EEXIST") {
						this.logger.err(`${this.name} already downloaded.  Please delete the downloaded file if you need to redownload it.`);
						reject(new Error(`${this.name} already downloaded.  Please delete the downloaded file if you need to redownload it.`));
					} else {
						this.logger.err("Error opening file to save to!");
						reject(err);
					}
					return;
				}
			}

			// Create request
			const req = https.request({
				host: this.url.split("/")[2],
				port: 443,
				path: this.url.slice(`https://${this.url.split("/")[2]}`.length)
			});

			req.on("response", res => {
				const len = parseInt(res.headers["content-length"], 10);
				const downloaded = "";
				if (!this.logger.isSilent) {
					const progress_bar = new ProgressBar(":bar :percent ETA: :etas", {
						complete: "▓",
						incomplete: "░",
						width: 50,
						total: isNaN(len) ? 6403580 : len
					});
					res.on("data", (chunk) => {
						progress_bar.tick(chunk.length);
					});
				}
				const fileStream = createWriteStream(this.fullPath);
				res.pipe(fileStream); // Pipe to writer
				res.on("end", () => {
					// console.log("");
					this.logger.info("Download complete.");
					fileStream.close();
					resolve();
				});
			});

			req.end();
		});
	}

	/**
	 * Extract the zip folder
	 */
	public extract() {
		return new Promise((resolve, reject) => {
			this.logger.info("Extracting...");
			// Validate existence
			access(this.fullPath, fs.constants.F_OK)
				.then(() => {
					this.logger.debug("Zip file found. Extracting...");
					// DO IT
					// From https://github.com/cthackers/adm-zip
					const zipFile = new AdmZip(this.fullPath);
					zipFile.extractAllTo(this.saveTo, true);
					resolve();
				})
				.catch(reject);
		});
	}
}
