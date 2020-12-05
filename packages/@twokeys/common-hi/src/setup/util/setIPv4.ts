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

import { BaseTwoKeysForCommands } from "../../common";
import * as errorCodes from "./errors";
import { networkInterfaces } from "os";
import { CodedError } from "@twokeys/core";
import { exec as execCB } from "child_process";
import { promisify } from "util";

const exec = promisify(execCB);

export interface SetStaticIPv4 {
	networkAdapter: string;
	ipv4: string;
}
export const IPV4_REGEXP = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
/** Only allow alphanumerica chars,(_)s and spaces to prevent command injection */
// NOTE: May need changing for internationlisation
export const IFACE_REGEXP = /^[a-zA-Z][\sa-zA-Z0-9[\]()]+$/i;
// export const IFACE_REGEXP = /^[\w\-\s]+$/; // Dahses, underscore and alphanumeric and spaces

function checkIP(twokeys: BaseTwoKeysForCommands, config: SetStaticIPv4): Promise<void> {
	return new Promise((resolve, reject) => {
		twokeys.logger.info("Checking IP was set....");
		let isSet = false;
		const timer = setInterval(function () {
			const newIfaces = networkInterfaces();
			const newIface = newIfaces[config.networkAdapter];
			if (typeof newIface === "undefined") {
				return reject(new CodedError(`Network Interface ${config.networkAdapter} has suddenly disappeared! This should be impossible. NOTE: IPv4 may have still been set`, errorCodes.NET_INTERFACE_NOT_FOUND));
			}
			const newFilteredIFace = newIface.filter(value => value.family === "IPv4");
			if (newFilteredIFace[0].address !== config.ipv4) {
				twokeys.logger.debug(`Not yet set. Got ${newFilteredIFace[0].address}.`);
			} else {
				isSet = true;
				clearInterval(timer);
				resolve();
			}
		}, 1500);

		// after 10 seconds stop
		// If isSet is false promise is yet to resolve and interval not cleared
		setTimeout(() => {
			if (!isSet) {
				clearInterval(timer);
				reject(new CodedError("IPv4 address was not set (within 10 secs)!", errorCodes.NET_IPV4_NOT_SET));
			}
		}, 7000);
	});
}

/**
 * Sets a static IPv4 address for the server
 * @param twokeys TwoKeys object to use for logging
 * @param config Config
 */
export default async function setStaticIPv4Address(twokeys: BaseTwoKeysForCommands, config: SetStaticIPv4): Promise<void> {
	twokeys.logger.substatus("Setting an ipv4 address. Please wait, this may take a moment.");
	twokeys.logger.info("Validating IPv4 address...");
	twokeys.logger.info(`Address: ${config.ipv4}`);
	if (!IPV4_REGEXP.test(config.ipv4)) {
		throw new CodedError("IPv4 address was not in the format of xxx.xxx.xxx.xxx!", errorCodes.NET_INVALID_IPV4);
	}
	twokeys.logger.debug("Checking interface name...");
	if (!IFACE_REGEXP.test(config.networkAdapter)) {
		throw new CodedError("Network interface was not alphanumeric (with brackets and spaces also allowed)!  This check is here to prevent command injection.", errorCodes.NET_INVALID_INTERFACE_NAME);
	}

	const ifaces = networkInterfaces();
	if (!(Object.prototype.hasOwnProperty.call(ifaces, config.networkAdapter) && typeof ifaces[config.networkAdapter] === "object")) {
		throw new CodedError(`Could not find network interface ${config.networkAdapter}!`, errorCodes.NET_INTERFACE_NOT_FOUND);
	}
	const iface = ifaces[config.networkAdapter];
	if (typeof iface === "undefined") {
		throw new CodedError(`Could not find network interface ${config.networkAdapter}!`, errorCodes.NET_INTERFACE_NOT_FOUND);
	}
	twokeys.logger.debug(`Found info for network interface ${config.networkAdapter}.`);
	twokeys.logger.debug("Looking for IPv4...");
	const filteredIFace = iface.filter(value => value.family === "IPv4");
	if (filteredIFace.length > 1) {
		twokeys.logger.debug(JSON.stringify(filteredIFace));
		throw new CodedError(`Found more than 1 IPv4 address for network interface ${config.networkAdapter}!  2Keys doesn't yet know how to handle this.`, errorCodes.NET_TOO_MANY_ENTRIES);
	}
	const theIFace = filteredIFace[0];
	twokeys.logger.info(`Current IP: ${theIFace.address}`);
	twokeys.logger.info("Changing your IP.  Please wait, this may take a moment...");
	await twokeys.logger.prompts.info("About to set your IPv4 address to a static IP.  Please accept the UAC prompt when prompted.");
	// NOTE: BE CAREFUL HERE!
	// Easy to do command injection
	// Ensure the IP address is valid (checked above)
	// And the network interface is a real one (also checked above)
	// start powershell -noexit -command "Start-Process netsh -Verb runAs -ArgumentList \"interface ipv4 set address name=`\"Network Bridge`\" static 192.168.0.40\""
	const command = `start powershell -Command "Start-Process netsh -Verb runAs -ArgumentList \\"interface ipv4 set address name=\`\\"${config.networkAdapter}\`\\" static ${config.ipv4}\\""`;
	twokeys.logger.debug(`Command: ${command}`);
	const res = await exec(command);
	twokeys.logger.debug(res.stdout);
	twokeys.logger.err(res.stderr);
	twokeys.logger.info("IP address set command ran.");

	await checkIP(twokeys, config);

	twokeys.logger.info("Done.");

}