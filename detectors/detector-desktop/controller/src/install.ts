import which from "which";
import { promises as fs, constants as fsconstants } from "fs";
import { DetectorPromisedTaskFunction, SOFTWARE_DOWNLOAD_TYPE_NO_DOWNLOAD, TwoKeys } from "@twokeys/addons/lib";
import { CodedError } from "@twokeys/core";
import * as errorCodes from "./errorCodes";
import { VAGRANT_DEFAULT_INSTALL_PATH, VBOX_DEFAULT_INSTALL_PATH, VIRTUALBOX_NAME, VIRTUALBOX_EXECUTABLE_NAME, VAGRANT_NAME, VAGRANT_EXECUTABLE_NAME } from "./constants";

async function getVagrantPath(twokeys: TwoKeys): Promise<string> {
	twokeys.logger.substatus("Checking for Vagrant");
	let vagrantPath: string;
	try {
		vagrantPath = await which("vagrant");
	} catch (err) {
		twokeys.logger.warn("Vagrant not found on PATH.  Using default install location.");
		twokeys.logger.debug(`Using ${VAGRANT_DEFAULT_INSTALL_PATH}`);
		vagrantPath = VAGRANT_DEFAULT_INSTALL_PATH;
	}

	// Check for access
	try {
		await fs.access(vagrantPath, fsconstants.F_OK);
	} catch (err) {
		if (err.code === "ENOENT") {
			throw new CodedError("Vagrant not found! Please check it is installed and if so specify the path manually in the configuration options.", errorCodes.APPLICATION_NOT_FOUND);
		} else {
			throw new CodedError(
				`Error accesing Vagrant! Please check it is installed and if so specify the path manually in the configuration options.  Full message: ${err.message}`,
				errorCodes.APPLICATION_ACCESS_ERROR
			);
		}
	}

	// No errors? Done!
	return vagrantPath;

	// TODO: Install Vagrant
}

async function getVBoxManagePath(twokeys: TwoKeys): Promise<string> {
	twokeys.logger.substatus("Checking for VBoxManage.exe");
	// Check ENV vars
	let vboxInstallPath: string | undefined;
	vboxInstallPath = process.env.VBOX_INSTALL_PATH || process.env.VBOX_MSI_INSTALL_PATH;
	if (typeof vboxInstallPath === "undefined") {
		twokeys.logger.warn("Using default install location because VBOX_INSTALL_PATH or VBOX_MSI_INSTALL_PATH environment variable was not found.");
		twokeys.logger.warn(`Using ${VBOX_DEFAULT_INSTALL_PATH}`);
		vboxInstallPath = VBOX_DEFAULT_INSTALL_PATH;
	}
	// Check access
	try {
		await fs.access(vboxInstallPath, fsconstants.F_OK);
	} catch (err) {
		if (err.code === "ENOENT") {
			throw new CodedError("VirtualBox not found! Please check it is installed and if so specify the path manually in the configuration options.", errorCodes.APPLICATION_NOT_FOUND);
		} else {
			throw new CodedError(
				`Error accesing VirtualBox! Please check it is installed and if so specify the path manually in the configuration options.  Full message: ${err.message}`,
				errorCodes.APPLICATION_ACCESS_ERROR
			);
		}
	}

	// No errors? Returns
	twokeys.logger.debug("VBox found.");
	return vboxInstallPath;

	// TODO: Install VBox
}

/**
 * Install stuff
 */
const install: DetectorPromisedTaskFunction<void, void> = async (twokeys) => {
	twokeys.logger.info("Configuring 2Keys to use VirtualBox and Vagrant...");
	// 0: Check vagrant and VBox is installed
	const vagrantPath = await getVagrantPath(twokeys);
	const vBoxPath = await getVBoxManagePath(twokeys);
	
	// Store into software
	twokeys.logger.info("Adding virtualbox to software registry");
	await twokeys.software.installSoftware({
		name: VIRTUALBOX_NAME,
		executables: [
			{
				name: VIRTUALBOX_EXECUTABLE_NAME,
				path: vBoxPath,
				arch: "x64",
				userInstalled: true,
			}
		],
		noAutoInstall: false,
		url: "https://www.virtualbox.org/wiki/Downloads",
		homepage: "https://www.virtualbox.org",
		downloadType: SOFTWARE_DOWNLOAD_TYPE_NO_DOWNLOAD
	});

	twokeys.logger.substatus("Adding vagrant to software registry");
	await twokeys.software.installSoftware({
		name: VAGRANT_NAME,
		executables: [
			{
				name: VAGRANT_EXECUTABLE_NAME,
				path: vagrantPath,
				arch: "x64",
				userInstalled: true,
			}
		],
		noAutoInstall: false,
		url: "https://www.vagrantup.com/downloads",
		homepage: "https://www.vagrantup.com/",
		downloadType: SOFTWARE_DOWNLOAD_TYPE_NO_DOWNLOAD
	});

	twokeys.logger.info("Done!");

};

export default install;