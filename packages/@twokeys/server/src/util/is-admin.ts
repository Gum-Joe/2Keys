/*
 * MIT License
 * 
 * Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * @license
 */

/**
 * From https://github.com/sindresorhus/is-admin/blob/master/index.js
 */
import { Logger } from "@twokeys/core";
import execa from "execa";

const logger = new Logger({
	name: "security",
});

// https://stackoverflow.com/a/28268802
async function testFltmc(): Promise<boolean> {
	try {
		await execa("fltmc");
		return true;
	} catch (_) {
		return false;
	}
}

/**
 * Check if the process is running as Administrator on Windows.
 * @returns Whether the process is running as Administrator. (true if admin)
 * @example
 * ```
 * const isAdmin = require('./is-admin');
 * (async () => {
 * 	console.log(await isAdmin());
 * 	//=> false
 * })();
 * ```
 */
export default async (): Promise<boolean> => {
	if (process.platform !== "win32") {
		return false;
	}

	try {
		// TODO: Convert this to not use `.shell` as it's slighly faster
		// https://stackoverflow.com/a/21295806/1641422
		logger.info("Checking if running as admin...");
		await execa.shell("fsutil dirty query %systemdrive%");
		return true;
	} catch (error) {
		if (error.code === "ENOENT") {
			logger.debug("Falling back fltmc for testing if admin");
			return testFltmc();
		}

		return false;
	}
};