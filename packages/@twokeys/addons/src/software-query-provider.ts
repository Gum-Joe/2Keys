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
 * Contains the code to provide DB querying of ANY Software Registry for ANY add-on
 * @packageDocumentation
 */
import { join } from "path";
import { constants as fsconstants, promises as fs } from "fs";
import sqlite3 from "sqlite3";
import { Database, open as openDB } from "sqlite";
import type { ISqlite } from "sqlite";
import { Logger } from "@twokeys/core";
import { REGISTRY_FILE_NAME, SOFTWARE_TABLE_NAME, CREATE_SOFTWARE_DB_QUERY, EXECUTABLES_TABLE_NAME, CREATE_EXECUTABLES_DB_QUERY, SOFTWARE_ROOT_FOLDER } from "./util/constants";
import { SoftwareInDB, ExecutableInDB, SoftwareDirectlyFromDB, ExecutableDirectlyFromDB, SQLBool, } from "./util/interfaces";
import mkdirp from "mkdirp";

/** Options for a new Software registry DB Provider */
export interface SoftwareRegistryDBProviderOptions {
	/**
	 * Location of software registry root.
	 * This folder contains folders for each installed add-on, which themselves have the registry in
	 */
	directory: string;
	/** Optional File name of DB */
	dbFileName?: string;
	/** Logger to use */
	Logger?: typeof Logger;
}

/**
 * Software Registry Query Provider class.
 * The main purpose of this class is to provide methods 2Keys itself may need that are related to the software DB.
 * This is so 2Keys can query the DB.
 * 
 * It should only provide a way to query the DB.
 *
 * It is extended by the actual software registry, but this class provides a package agnaotic way to query the software DB.
 * This is because the software is stored in the package registry itself, instead of one DB per software.
 *
 * **INTERNAL (I.E. WITHIN 2KEYS) USE ONLY**
 */
export default class SoftwareRegistryQueryProvider {
	/** Root directory of registry with software in */
	public directory: string;
	// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
	// NOTE: DB initalised automatically.
	public db!: Database;
	protected dbFilePath: string;
	protected logger: Logger;
	protected LoggerConstructor: typeof Logger = Logger;
	constructor(options: SoftwareRegistryDBProviderOptions) {
		this.directory = options.directory;
		this.dbFilePath = join(this.directory, options.dbFileName || REGISTRY_FILE_NAME);
		this.logger = new (options.Logger || Logger)({ name: "software" });
		this.LoggerConstructor = options.Logger || Logger;
	}
	/**
	 * Initalises the DB so we can use it (if the DB is yet to be opened)
	 * @param entry
	 */
	public async initDB(): Promise<void> {
		if (typeof this.db === "undefined") {
			this.logger.debug("Opening DB...");
			this.db = await openDB({
				filename: this.dbFilePath,
				driver: sqlite3.Database,
			});
			this.logger.debug("DB Open.");
		}
	}

	public async uninstallSoftware(name: string, ownerName: string): Promise<ISqlite.RunResult> {
		this.logger.debug(`Deleting software ${name} from DB...`);
		this.logger.debug("Deleting all executables first, and then software...");
		const deleteExecutables = `
			DELETE FROM ${EXECUTABLES_TABLE_NAME}
			WHERE softwareId = (
				SELECT id FROM ${SOFTWARE_TABLE_NAME}
				WHERE name = @softwareName AND ownerName = @ownerName
			);`;
		const deleteSoftware = `
			-- Then delete the software
			DELETE FROM ${SOFTWARE_TABLE_NAME}
			WHERE name = @softwareName AND ownerName = @ownerName;
		`;
		this.logger.debug(deleteExecutables);
		this.logger.debug(deleteSoftware);
		await this.db.run(deleteExecutables, {
			"@softwareName": name,
			"@ownerName": ownerName,
		});
		return this.db.run(deleteSoftware, {
			"@softwareName": name,
			"@ownerName": ownerName,
		});
	}

	/**
	 * Retrieves software from the DB and it's executables.
	 *
	 * Please note that whilst this function allows software with the same name belonging to the same add-on **WE DO NOT RECCOMMEND THIS AT ALL**
	 * as it will throw an error when trying to install a software with a name already in the DB.
	 * However, please note software from separate add-ons can have the same names, just not software from the same add-on
	 *
	 * NOTE:
	 * - `null` for name means retrieve all software
	 * - `null` for ownerName (you can only provide this when using a raw {@link SoftwareRegistryQueryProvider}) means retrieve all software of name
	 *
	 * Example:
	 * ```typescript
	 * const software =  new SoftwareRegistryQueryProvider(...arguments)
	 * software.getSoftwares() // Get everything from the DB
	 * software.getSoftwares("a") // Get all software of name "a"
	 * software.getSoftwares(null, "b") // Get all software that add-on "b" has added to the DB
	 * ```
	 * @param name Name of software to get
	 * @param ownerName Add-on that installed the software
	 */
	public async getSoftwares(name: string | undefined | null = "*", ownerName = "*"): Promise<SoftwareInDB[]> {
		this.logger.debug(`Retrieving software of name ${name} for add-on ${ownerName || "*"} in full...`);
		await this.initDB();
		this.logger.debug("Getting software...");
		let softwaresFromDB: SoftwareDirectlyFromDB[];
		if (name === "*" && ownerName === "*") {
			this.logger.debug("Getting everything...");
			softwaresFromDB = await this.db.all<SoftwareDirectlyFromDB[]>(`SELECT * FROM ${SOFTWARE_TABLE_NAME};`);
		} else if (name !== "*" && ownerName === "*") {
			// Get all software of a given name, regarless of ownerName
			softwaresFromDB = await this.db.all<SoftwareDirectlyFromDB[]>(`SELECT * FROM ${SOFTWARE_TABLE_NAME} WHERE name = ?;`, name);
		} else if ((name === "*" || !name) && ownerName !== "*") {
			// Get all software for a given add-on
			softwaresFromDB = await this.db.all<SoftwareDirectlyFromDB[]>(`SELECT * FROM ${SOFTWARE_TABLE_NAME} WHERE ownerName = ?;`, ownerName);
		} else {
			// Get all for a specific add-on and of a given type
			softwaresFromDB = await (await this.db.prepare(`SELECT * FROM ${SOFTWARE_TABLE_NAME} WHERE name = @name AND ownerName = @owner;`)).all<SoftwareDirectlyFromDB[]>({
				"@name": name,
				"@owner": ownerName,
			});
		}
		// Parse SoftwareInDB so that SQLBools are converted to JS bools
		this.logger.debug("Converting softwares for JS...");
		const softwares = softwaresFromDB.map((software: SoftwareDirectlyFromDB) => {
			// NOTE: Keep in syn with {@link SoftwareDirectlyFromDB} and 
			(software as unknown as SoftwareInDB).installed = software.installed === SQLBool.False ? false : true;
			(software as unknown as SoftwareInDB).noAutoInstall = software.noAutoInstall === SQLBool.False ? false : true;
			return software as unknown as SoftwareInDB;
		});
		// Retrieve executables for each
		// Ideally we'd use a JOIN SQL Statement
		// But this is difficult with SQL (basically we'd have to filter out the columns, and also dyanmically rename them)
		// Maybe a future optimisation
		// From https://medium.com/hackernoon/async-await-essentials-for-production-loops-control-flows-limits-23eb40f171bd
		// Note that async functions return a promise
		const promises = softwares.map(async (item) => {
			const executables = await this.db.all<ExecutableDirectlyFromDB[]>(`SELECT * FROM ${EXECUTABLES_TABLE_NAME} WHERE softwareId = ?`, [item.id]);
			// Convert
			const parsedExecutables = executables.map((executable) => {
				(executable as unknown as ExecutableInDB).userInstalled = executable.userInstalled === SQLBool.False ? false : true;
				return executable as unknown as ExecutableInDB;
			});
			item.executables = parsedExecutables;
			return item;
		});
		this.logger.debug("Retrievals now running.");
		return Promise.all(promises);
	}

	/**
	 * Gets an execuatble from the DB.
	 * 
	 * For anything outside of a single executable
	 * (or getting all executables for a single piece of software),
	 * please just query the DB directly.
	 * 
	 * @param software Name of software executable belongs to
	 * @param name Name of executable (omit this parameter or use null to get all executables)
	 * @param ownerName Name of owner (add-on) of the software in question
	 */
	public async getExecutables(software: string, name: string | null, ownerName: string):
	Promise<ExecutableInDB[]> {
		this.logger.debug(`Retrieving executable of name ${name ?? "*"} from software ${software} for add-on ${ownerName} in full...`);
		// Auto load
		await this.initDB();
		// 
		// Query
		this.logger.debug("Querying...");
		const queryText = `
			SELECT * FROM ${EXECUTABLES_TABLE_NAME}
			WHERE ${!name ? "" : "name = @executableName AND"}
			softwareId = (
				SELECT id FROM ${SOFTWARE_TABLE_NAME}
				WHERE name = @softwareName AND ownerName = @ownerName
			);
		`;
		this.logger.debug(queryText);
		// Hack to only use executable name in prepared query if provided
		const useExecutableName = !name ? {} : { "@executableName": name };
		return this.db.all<ExecutableInDB[]>(queryText, {
			...useExecutableName,
			"@softwareName": software,
			"@ownerName": ownerName,
		});
	}

	// Util methods
	/**
	 * Gets software folder root
	 * @param ownerName Add-on that software folder is for
	 */
	public getSoftwareFolderRoot(ownerName: string): string {
		return join(this.directory, SOFTWARE_ROOT_FOLDER, ownerName);
	}

	/**
	 * Gets folder for a given piece of software
	 * @param ownerName Add-on that software folder is for
	 */
	public getOneSoftwareFolder(softwareName: string, ownerName: string): string {
		return join(this.getSoftwareFolderRoot(ownerName), softwareName);
	}

	// Static methods
	/**
	 * Creates a registry
	 * @param directory Directory to create registry in
	 * @param fileName Filename of registry, defaulting to {@link REGISTRY_FILE_NAME} (it is recomended you leave it as the default)
	 */
	public static async createSoftwareRegistry(directory: string, fileName: string = REGISTRY_FILE_NAME, LoggerConstructor = Logger): Promise<void> {
		// Create DB
		const logger = new LoggerConstructor({ name: "add-ons:software" });
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
			await mkdirp(join(directory, SOFTWARE_ROOT_FOLDER));
			logger.info("Software install dir created.");
		} catch (err) {
			logger.err("An error was encountered!");
			if (err.code === "ENOENT") {
				logger.err("Error! Registry DB likely does not exist!");
				logger.err("This probably means your 2Keys install is corrupt!");
				logger.err("Please (re)create the registry DB first!");
				err.message = `Registry DB likely does not exist! Please (re)create the registry DB first! Original message: ${err.message}`;
				throw err;
			} else {
				logger.err(err.message);
				throw err;
			}
		}
	}
}
