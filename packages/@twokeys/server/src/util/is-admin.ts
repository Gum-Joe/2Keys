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

	// Undocumented env variable that allows running as admin
	// Leaving as undocumented because I don't think people should be using it
	// and by putting it in the documentation it might invite users to use it
	// NOTE: The NODE_ENV check is there so that we can run tests in CI (our CI provider runs the tests as admin)
	// If you come accross this and decide to try it:
	// 1: Understand the security risks of running 2Keys as admin (that being mainly that malware could adjust your (non-admin protected) config to execute malware for privilege esculation.)
	// (this is undocumented for a reason)
	// 2: Protect your 2Keys project config from modification by non-admin level programs
	// 3: Set the environment varibale TWOKEYS_ALLOW_ADMIN to "true"
	if (process.env.TWOKEYS_ALLOW_ADMIN === "true" || process.env.NODE_ENV === "test") {
		logger.warn("WARNING! Running as admin has been permitted!");
		logger.warn("Malware could adjust your (non-admin protected) config to execute malware for privilege esculation.");
		logger.warn("Please ensure you understand the security risks of this before continueing.");
		return false; // Fake not running as admin
	}

	try {
		// https://stackoverflow.com/a/21295806/1641422
		logger.info("Checking if NOT running as admin...");
		await execa("fsutil", ["dirty", "query", process.env.systemdrive || "C:"]);
		return true;
	} catch (error) {
		if (error.code === "ENOENT") {
			logger.debug("Falling back fltmc for testing if admin");
			return testFltmc();
		}

		return false;
	}
};