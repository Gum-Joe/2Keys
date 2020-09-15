import { TwoKeys, TWOKEYS_ADDON_TYPE_DETECTOR } from "@twokeys/addons";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { ClientConfigHere } from "../../../config";
import { VAGRANT_EXECUTABLE_NAME, VAGRANT_NAME, VM_LAUNCH_BAT_FILE_DEST, VM_LAUNCH_BAT_FILE_TEMPLATE, VM_LAUNCH_VBS_FILE_DEST, VM_LAUNCH_VBS_FILE_TEMPLATE } from "../../../constants";
import Handlebars from "handlebars";

/**
 * Params for handlebars template for .bat script (which runs `vagrant up` to start the vm)
 * @see VM_LAUNCH_BAT_FILE_TEMPLATE
 */
export interface VMLaunchBATParams {
	/** Absolute path to dir where Vagrantfile is stored */
	vm_host_root_dir: string;
	/** Absolute path from config to where vagrant is stored */
	vagrant_path: string;
}

/**
 * Params for handlebars template for vbs script (which start {@link VM_LAUNCH_BAT_FILE_TEMPLATE} in the background)
 * @see VMLaunchBATParams
 */
export interface VMLaunchVBSParams {
	/** Absolute path to {@link VM_LAUNCH_BAT_FILE_TEMPLATE} */
	vm_launch_script: string;
}

/** Updates vm launch startup files with the correct info */
export default async function updateVMLaunchFiles(twokeys: TwoKeys<TWOKEYS_ADDON_TYPE_DETECTOR>, config: ClientConfigHere): Promise<void> {
	twokeys.logger.substatus("Updating VM startup files");
	twokeys.logger.info("Note: If starting on startup has been disallowed, startup files are still generated but not setup to be ran on boot");

	twokeys.logger.debug("Updating .bat launch script");
	const batTemplate = await readFile(join(twokeys.properties.clientRoot, VM_LAUNCH_BAT_FILE_TEMPLATE));
	const batCompiledTemplate = Handlebars.compile<VMLaunchBATParams>(batTemplate);
	const batFile = batCompiledTemplate({
		vm_host_root_dir: twokeys.properties.clientRoot,
		vagrant_path: config.executables.vagrant || (await twokeys.software.getExecutable(VAGRANT_NAME, VAGRANT_EXECUTABLE_NAME)).path,
	});
	twokeys.logger.debug("Writing .bat file that launches VM...");
	await writeFile(join(twokeys.properties.clientRoot, VM_LAUNCH_BAT_FILE_DEST), batFile);

	twokeys.logger.debug("Updating .vbs launch script");
	const template = await readFile(join(twokeys.properties.clientRoot, VM_LAUNCH_VBS_FILE_TEMPLATE));
	const vbsCompiledTemplate = Handlebars.compile<VMLaunchVBSParams>(template);
	const vbsFile = vbsCompiledTemplate({
		vm_launch_script: join(twokeys.properties.clientRoot, VM_LAUNCH_BAT_FILE_DEST)
	});
	twokeys.logger.debug("Writing VBS file that start .bat file in background...");
	await writeFile(join(twokeys.properties.clientRoot, VM_LAUNCH_VBS_FILE_DEST), vbsFile);

	twokeys.logger.info("Startup file generated, but not linked so windows knows to run them on boot.");
}