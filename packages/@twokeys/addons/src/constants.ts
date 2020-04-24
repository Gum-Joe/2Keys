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
 * @file Constants
 */

export const PACKAGE_VERSION = require("../package.json").version;

export const REGISTRY_FILE_NAME = "twokeys-registry.db";

/** The default package.json file created that represents what's installed in the registry */
export const DEFAULT_REGISTRY_ROOT_PACKAGE_JSON = {
	DO_NOT_MODIFY: true,
	name: "twokeys-local-registry",
	version: PACKAGE_VERSION,
	private: true,
	dependencies: {},
};

/** Name of table in the sqlite3 regstry DB to insert add-ons to */
export const REGISTRY_TABLE_NAME = "packages";
/** SQL Query to create packages table */
export const CREATE_REGISTRY_DB_QUERY = `CREATE TABLE ${REGISTRY_TABLE_NAME} (
	id TEXT,
	name TEXT,
	types TEXT,
	info TEXT,
	entry TEXT,
	PRIMARY KEY (id)
)`;
