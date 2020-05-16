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
 * Contains the software registry code
 * @packageDocumentation
 */

import { join, basename } from "path";
import { constants as fsconstants, promises as fs } from "fs";
import { Database, open as openDB } from "sqlite";
import * as uuid from "uuid";
import sqlite3 from "sqlite3";
import { Logger } from "@twokeys/core";
import Downloader from "./util/downloader";
import ZipDownloader from "./util/zip-downloader";
import { REGISTRY_FILE_NAME, SOFTWARE_TABLE_NAME, CREATE_SOFTWARE_DB_QUERY, EXECUTABLES_TABLE_NAME, CREATE_EXECUTABLES_DB_QUERY, SOFTWARE_ROOT_FOLDER } from "./util/constants";
import {
	Software,
	Executable,
	Package,
	TWOKEYS_ADDON_TYPES,
	SQLBool,
	SOFTWARE_DOWNLOAD_TYPE_NO_DOWNLOAD,
	SOFTWARE_DOWNLOAD_TYPE_STANDALONE,
	SOFTWARE_DOWNLOAD_TYPE_ZIP
} from "./util/interfaces";

// Interface to implement
interface SoftwareRegI {
	// Properties
	db?: Database;
	directory: string;

	// Methods
	/** Intialises the DB */
	initDB(): Promise<void>;
	/** Downloads and installs a piece of software. */
	installSoftware(software: Software): Promise<void>;
	/** Runs install on a piece of software where {@link Software.runInstall} was false */
	runInstall(software: Software): Promise<void>;
	/** Uninstall a piece of software */
	uninstallSoftware(name: string): Promise<void>;
	/** Update records for a piece of software */
	updateSoftwareRecord(name: string, newData: Software): Promise<void>;
	/** Get full path to an executable */
	getExecutablePath(software: string, name: string): Promise<string>;
	/** Get executable object */
	getExecutable(software: string, name: string): Promise<Executable>;
	/** Get software object */
	getSoftware(name: string): Promise<Software>;
	/** Converts software in DB to a {@link Software} */
	parseSoftwareFromDB(softwareFromDB: any): Software;
}
/** Options for a new Software registry */
interface SoftwareRegistryOptions<PackageType extends TWOKEYS_ADDON_TYPES> {
	/**
	 * Location of software registry root.
	 * This folder contains folders for each installed add-on, which themselves have the registry in
	 */
	directory: string;
	/** Package object for software registry */
	package: Package<PackageType>;
	/** Optional File name of DB */
	dbFileName?: string;
	/** Logger to use */
	logger?: Logger;
}
/**
 * Software registry class
 * This is a registry of software that is installed for a **specific** add-on.
 * It is stored as a table in the registry DB ({@link SOFTWARE_TABLE_NAME}).
 * It is noted all software is stored in one table and the ownerName field used to limit software to only that used by an add-on
 */
export default class SoftwareRegistry<PackageType extends TWOKEYS_ADDON_TYPES> implements SoftwareRegI {
	/** Root directory of registry with software in */
	public directory: string;
	// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
	// @ts-ignore: DB initalised automatically.
	public db: Database;
	/** Package Object representing the add-on the software reg is for */
	public package: Package<PackageType>;
	private dbFilePath: string;
	private logger: Logger;

	constructor(options: SoftwareRegistryOptions<PackageType>) {
		this.package = options.package;
		this.directory = options.directory;
		this.dbFilePath = join(this.directory, options.dbFileName || REGISTRY_FILE_NAME);
		this.logger = options.logger || new Logger({ name: "software:" + options.package.name });
	}

	/** Creates a registry */
	public static async createSoftwareRegistry(directory: string, fileName: string = REGISTRY_FILE_NAME): Promise<void> {
		// Create DB
		const logger = new Logger({ name: "add-ons:software" });
		try {
			const fullFilePath = join(directory, fileName);
			logger.info("Creating a software DB...");
			await fs.access(fullFilePath, fsconstants.F_OK); // If error throws, something went wrong
			const db = await openDB({
				filename: fullFilePath,
				driver: sqlite3.Database,
			});
			logger.debug(`Adding ${SOFTWARE_TABLE_NAME} table...`);
			await db.exec(CREATE_SOFTWARE_DB_QUERY);
			logger.debug(`Adding ${EXECUTABLES_TABLE_NAME} table...`);
			await db.exec(CREATE_EXECUTABLES_DB_QUERY);
			logger.debug("Closing...");
			await db.close();
			logger.info("SQLite registry DB & tables created.");
		} catch (err) {
			logger.err("An error was encountered!");
			if (err.code === "ENOENT") {
				logger.err("Error! Registry DB likely does not exist!");
				logger.err("This probably means your 2Keys install is corrupt!");
				logger.err("Please (re)create the registry DB first!");
				err.message = `Registry DB likely does not exist! Please (re)create the registry DB first! Original message: ${err.message}`;
				throw err;
			} else if (err.stack.includes(`table ${SOFTWARE_TABLE_NAME} already exists`)) {
				logger.err("Software table already existed!  Executables table may not have been made!");
				logger.throw_noexit(err);
				throw new Error("Software table already existed!  Executables table may not have been made!");
			} else if (err.stack.includes(`table ${EXECUTABLES_TABLE_NAME} already exists`)) {
				logger.err("Executables table already existed! This means software table did not, so there may be corruption in the DB!");
				logger.throw_noexit(err);
				throw new Error("Executables table already existed! This means software table did not, so there may be corruption in the DB!");
			} else {
				throw err;
			}
		}
	}

	/**
	 * Initalises the DB so we can use it
	 * @param entry 
	 */
	public async initDB(): Promise<void> {
		this.logger.debug("Opening DB...");
		this.logger.debug("Checking for dir...");
		this.db = await openDB({
			filename: this.dbFilePath,
			driver: sqlite3.cached.Database,
		});
		this.logger.debug("DB Open.");
	}

	/**
	 * Adds a piece of software to the DB, along with its executables.
	 * Then run {@link SoftwareRegistry.runInstall}
	 */
	public async installSoftware(software: Software): Promise<void> {
		this.logger.info(`Installing software ${software.name}...`);
		if (!this.db || typeof this.db === "undefined") {
			await this.initDB();
		}
		this.logger.info("Adding software to registry...");
		const softwareUUID = uuid.v4();
		const stmt = await this.db.prepare(
			`INSERT INTO ${SOFTWARE_TABLE_NAME} (id, name, url, homepage, ownerName, installed) VALUES (@id, @name, @url, @homepage, @ownerName, @installed)`,
		);
		await stmt.all({
			"@name": software.name,
			"@id": softwareUUID,
			"@url": software.url,
			"@homepage": software.homepage,
			"@ownerName": this.package.name,
			"@installed": SQLBool.False, // NOTE: Use 0 for false and 1 for true
		});
		this.logger.info("Adding executables to registry...");
		for (const executable of software.executables) {
			const executablesStmt = await this.db.prepare(
				`INSERT INTO ${EXECUTABLES_TABLE_NAME} (id, name, path, arch, os, softwareId) VALUES (@id, @name, @path, @arch, @os, @softwareId)`,
			);
			await executablesStmt.all({
				"@name": executable.name,
				"@id": uuid.v4(),
				"@path": Object.prototype.hasOwnProperty.call(executable, "userInstalled") && executable.userInstalled ? executable.path : join(this.getOneSoftwareFolder(software.name), executable.path),
				"@arch": executable.arch,
				"@os": executable.os || process.platform,
				"@softwareId": softwareUUID,
			});
		}
		this.logger.debug("Now running install function...");
		return await this.runInstall(software);
	}
	/**
	 * Downloads and installs a piece of software.
	 * Please Note:
	 * - Software of type {@link SOFTWARE_DOWNLOAD_TYPE_ZIP} will be directly extract to the folder where the zip is saved.
	 * - Software of type {@link SOFTWARE_DOWNLOAD_TYPE_STANDALONE} will cause software to be downloaded to a file that is saved as the last part of the url, if {@link Software.filename} is not given
	 * @param software Software object to install
	 */
	public async runInstall(software: Software): Promise<void> {
		this.logger.info(`Downloading and installing software of ${software.name}....`);
		if (software.noAutoInstall || software.downloadType === SOFTWARE_DOWNLOAD_TYPE_NO_DOWNLOAD) {
			this.logger.warn(`Software ${software.name} not downloaded and installed as noAutoInstall was set, or download type was ${SOFTWARE_DOWNLOAD_TYPE_NO_DOWNLOAD}!`);
			this.logger.warn("This could mean an add-on requires you to install software yourself!");
			this.logger.warn(`Add-on: ${this.package.name}`);
			this.logger.debug(`noAutoInstall: ${software.noAutoInstall}`);
			this.logger.debug(`downloadType: ${software.downloadType}`);
			return;
		}
		// Begin
		// Create the save path
		const savePathDir = this.getOneSoftwareFolder(software.name);
		this.logger.debug(`Type: ${software.downloadType}`);
		this.logger.debug(`Save dir: ${savePathDir}`);
		switch (software.downloadType) {
			case SOFTWARE_DOWNLOAD_TYPE_STANDALONE: {
				const downloader = new Downloader(software, join(savePathDir, software.filename || basename(software.url)), { logger: this.logger });
				await downloader.download();
				break;
			}
			case SOFTWARE_DOWNLOAD_TYPE_ZIP: {
				const downloader = new ZipDownloader(software, join(savePathDir, software.filename || "tmp.zip"), savePathDir, { logger: this.logger });
				await downloader.download();
				await downloader.extract();
				break;
			}
		}
		this.logger.info("Software downloaded.");
		return;
	}
	uninstallSoftware(name: string): Promise<void> {
		throw new Error("Method not implemented.");
	}
	updateSoftwareRecord(name: string, newData: Software): Promise<void> {
		throw new Error("Method not implemented.");
	}
	getExecutablePath(software: string, name: string): Promise<string> {
		throw new Error("Method not implemented.");
	}
	getExecutable(software: string, name: string): Promise<Executable> {
		throw new Error("Method not implemented.");
	}
	getSoftware(name: string): Promise<Software> {
		throw new Error("Method not implemented.");
	}
	parseSoftwareFromDB(softwareFromDB: any): Software {
		throw new Error("Method not implemented.");
	}

	/**
	 * Gets software folder root
	 */
	public getSoftwareFolderRoot(): string {
		return join(this.directory, SOFTWARE_ROOT_FOLDER, this.package.name);
	}

	/**
	 * Gets folder for a given piece of software
	 */
	public getOneSoftwareFolder(softwareName: string): string {
		return join(this.getSoftwareFolderRoot(), softwareName);
	}


} 