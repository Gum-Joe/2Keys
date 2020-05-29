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
import { Database, open as openDB, Statement } from "sqlite";
import type { ISqlite } from "sqlite";
import * as uuid from "uuid";
import { Logger } from "@twokeys/core";
import { REGISTRY_FILE_NAME, SOFTWARE_TABLE_NAME, CREATE_SOFTWARE_DB_QUERY, EXECUTABLES_TABLE_NAME, CREATE_EXECUTABLES_DB_QUERY, SOFTWARE_ROOT_FOLDER } from "./util/constants";
import { SoftwareInDB, ExecutableInDB, Executable, SQLBool, Software } from "./util/interfaces";

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
	logger?: Logger;
}

/**
 * Software Registry Query Provider class.
 * The main purpose of this class is to provide methods 2Keys itself may need that are related to the software DB.
 * This is so 2Keys can query the DB
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
	// @ts-ignore: DB initalised automatically.
	public db: Database;
	protected dbFilePath: string;
	protected logger: Logger;
	constructor(options: SoftwareRegistryDBProviderOptions) {
		this.directory = options.directory;
		this.dbFilePath = join(this.directory, options.dbFileName || REGISTRY_FILE_NAME);
		this.logger = options.logger || new Logger({ name: "software" });
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
	 * Updates a software record.
	 * 
	 * Notes:
	 * - If providing s new executable, all props must be provided (as you would to {@link SoftwareRegistry.installSoftware}) - see {@link Executable}
	 * 	- for this, the path should also be relative to the software root - if a new name for the software is set, we handle using the right path ourselves.
	 * 
	 * Dev notes: schema of SQL needs to be kept in sync with {@link SoftwareRegistry.installSoftware}
	 * @param name Name of software to update
	 * @param newData Software object with only the properties to change in.
	 * 	It is Recomended you combine new props with those already in the DB.
	 * 	As name is a separate param, you can change the name in here.
	 * 	The software will be auto copied into a new folder under the new name (TODO)
	 * @param ownerName Name of add-on that owns software
	 */
	public async updateSoftwareRecord<SoftwareType extends Software = SoftwareInDB>
	(name: string, newData: Partial<SoftwareType> & { executables?: SoftwareType extends SoftwareInDB ?
		Array<Partial<ExecutableInDB>> : Array<Partial<Executable>>;
	}, ownerName: string): Promise<void> {
		this.logger.debug(`Updating software record of ${name}...`);
		// Checks if the property is in newData
		const objectHasProperty = (obj: object, field: string): boolean => {
			return Object.prototype.hasOwnProperty.call(obj, field) && typeof newData[field] !== "undefined";
		};
		const newDataHasProperty = (field: string): boolean => {
			return objectHasProperty(newData, field);
		};
		// Generate update key = value s
		const generateKeyValues = (params): string => {
			let stmt = "";
			for (const param in params) {
				if (Object.prototype.hasOwnProperty.call(params, param)) {
					// Add it
					// Chop off the A
					stmt += ` ${param.slice(1)} = ${param}\n`; // \n so statments are not joined
				}
			}
			return stmt;
		}
		// Params
		const params = {
			"@originalName": name,
			"@ownerName": ownerName,
			...newDataHasProperty("name") && { "@name": newData.name },
			...newDataHasProperty("url") && { "@url": newData.url },
			...newDataHasProperty("homepage") && { "@homepage": newData.homepage },
			...newDataHasProperty("downloadType") && { "@downloadType": newData.downloadType },
		};
		const queryText = `
		UPDATE ${SOFTWARE_TABLE_NAME} SET
		${generateKeyValues(params)}
		WHERE name = @originalName AND ownerName = @ownerName;
		`;
		this.logger.debug(queryText);
		// Generate statement
		const stmt = await this.db.prepare(queryText);
		this.logger.debug("Running query...");
		await stmt.all(params);
		// Update executables
		this.logger.debug("Updating executables in DB...");
		// Safeguard in case user changed ID in newData
		const softwareId = await this.db.get(`SELECT id FROM ${SOFTWARE_TABLE_NAME} WHERE name = ? AND ownerName = ?`, [name, ownerName]);
		// ID is required so we can locate it, this is easier than an originalName field
		const executableUpdatePromises = newData.executables?.map(async (executable: Partial<ExecutableInDB>) => {
			let executableParams;
			let executablesStmt: Statement;
			// Create params
			if (typeof this.db.get(`SELECT * FROM ${EXECUTABLES_TABLE_NAME} WHERE name = ? AND softwareId = ?`, [name, softwareId]) === "undefined") {
				if (typeof executable.path === "undefined") {
					throw Error(`No path found on executable ${executable.name}!`);
				}
				// Not there
				// Get params
				executableParams = {
					"@name": executable.name,
					"@id": uuid.v4(),
					"@path": Object.prototype.hasOwnProperty.call(executable, "userInstalled") && executable.userInstalled ?
						executable.path : join(this.getOneSoftwareFolder(newData.name || name, ownerName), executable.path),
					"@arch": executable.arch,
					"@os": executable.os || process.platform,
					"@userInstalled": Object.prototype.hasOwnProperty.call(executable, "userInstalled") && executable.userInstalled ? SQLBool.True : SQLBool.False,
					"@softwareId": softwareId,
				};
				// Use an INSERT
				// Literally copied from installSoftware()
				executablesStmt = await this.db.prepare(
					`INSERT INTO ${EXECUTABLES_TABLE_NAME}
					(id, name, path, arch, os, userInstalled, softwareId)
					VALUES (@id, @name, @path, @arch, @os, @userInstalled, @softwareId)`
				);
			} else {
				executableParams = {
					"@name": executable.name,
					"@softwareId": softwareId,
					// Typeof requred here so TS listens to it
					...typeof executable.path !== "undefined" && {
						"@path": Object.prototype.hasOwnProperty.call(executable, "userInstalled") && executable.userInstalled ?
							executable.path : join(this.getOneSoftwareFolder(newData.name || name, ownerName), executable.path)
					},
					...objectHasProperty(executable, "arch") && { "@arch": executable.arch },
					...objectHasProperty(executable, "os") && { "@os": executable.os }, // process.platform is already in DB
					...objectHasProperty(executable, "userInstalled") && { "@userInstalled": executable.userInstalled ? SQLBool.True : SQLBool.False }
				};
				executablesStmt = await this.db.prepare(
					`UPDATE ${EXECUTABLES_TABLE_NAME}
					SET 
					${generateKeyValues(params)}
					WHERE name = @name AND softwareId = @softwareId`
				);
			}
			// Provide params and do it
			return executablesStmt.all(executableParams);
		}); 
		// Do inserts
		this.logger.debug("Running executable inserts...");
		await Promise.all(executableUpdatePromises || []);
		// DONE!
		this.logger.debug("Done.");
		return;
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
		if (!this.db || typeof this.db === "undefined") {
			await this.initDB();
		}
		this.logger.debug("Getting software...");
		let softwares: SoftwareInDB[];
		if (name === "*" && ownerName === "*") {
			this.logger.debug("Getting everything...");
			softwares = await this.db.all<SoftwareInDB[]>(`SELECT * FROM ${SOFTWARE_TABLE_NAME};`);
		} else if (name !== "*" && ownerName === "*") {
			// Get all software of a given name, regarless of ownerName
			softwares = await this.db.all<SoftwareInDB[]>(`SELECT * FROM ${SOFTWARE_TABLE_NAME} WHERE name = ?;`, name);
		} else if ((name === "*" || !name) && ownerName !== "*") {
			// Get all software for a given add-on
			softwares = await this.db.all<SoftwareInDB[]>(`SELECT * FROM ${SOFTWARE_TABLE_NAME} WHERE ownerName = ?;`, ownerName);
		} else {
			// Get all for a specific add-on and of a given type
			softwares = await (await this.db.prepare(`SELECT * FROM ${SOFTWARE_TABLE_NAME} WHERE name = @name AND ownerName = @owner;`)).all<SoftwareInDB[]>({
				"@name": name,
				"@owner": ownerName,
			});
		}
		// Retrieve executables for each
		// Ideally we'd use a JOIN SQL Statement
		// But this is difficult with SQL (basically we'd have to filter out the columns, and also dyanmically rename them)
		// Maybe a future optimisation
		// From https://medium.com/hackernoon/async-await-essentials-for-production-loops-control-flows-limits-23eb40f171bd
		// Note that async functions return a promise
		const promises = softwares.map(async (item) => {
			const executables = await this.db.all<ExecutableInDB[]>(`SELECT * FROM ${EXECUTABLES_TABLE_NAME} WHERE softwareId = ?`, [item.id]);
			item.executables = executables;
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
		if (!this.db || typeof this.db === "undefined") {
			await this.initDB();
		}
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
				logger.err(err.message);
				throw err;
			}
		}
	}
}
