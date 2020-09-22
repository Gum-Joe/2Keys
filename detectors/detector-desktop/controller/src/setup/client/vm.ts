import { TwoKeys, TWOKEYS_ADDON_TYPE_DETECTOR } from "@twokeys/addons";
import { CodedError } from "@twokeys/core";
import { spawn } from "child_process";
import { ClientConfigHere } from "../../config";
import { VAGRANT_EXECUTABLE_NAME, VAGRANT_NAME } from "../../constants";
import { BAD_VAGRANT_EXIT_CODE } from "../../errorCodes";

/** Start the Vagrant VM by running vagrant up */
export function startVM(twokeys: TwoKeys<TWOKEYS_ADDON_TYPE_DETECTOR>, config: ClientConfigHere): Promise<void> {
	return new Promise((resolve, reject) => {
		twokeys.logger.status("Starting VM.");
		twokeys.software.getExecutable(VAGRANT_NAME, VAGRANT_EXECUTABLE_NAME).then((executable) => {
			const vagrantPath = executable.path;
			twokeys.logger.debug(`Spawning in ${twokeys.properties.clientRoot}.`);
			const vagrantUp = spawn(config.executables.vagrant || vagrantPath, ["up"], {
				cwd: twokeys.properties.clientRoot
			});
			vagrantUp.on("error", (err) => {
				twokeys.logger.err("Error starting VM!");
				reject(err);
			});
			const vagrantLogger = new twokeys.LoggerConstructor({
				name: "vagrant",
			});
			let provisioning = false; // Ensure we only print the message once
			vagrantUp.stdout.on("data", (data) => {
				// TODO: Better logging
				const dataStr: string = data.toString("utf8").trim();
				vagrantLogger.info(dataStr);
				if (dataStr.includes("Booting") && dataStr.includes("VM")) {
					twokeys.logger.status("Booting VM. Please wait");
				} else if (dataStr.includes("provision") && !provisioning) {
					twokeys.logger.substatus("Provisioning VM. Please wait.");
					provisioning = true;
				}
			});
			vagrantUp.stderr.on("data", (data) => {
				vagrantLogger.err(data.toString("utf8").trim());
			});
			vagrantUp.on("close", (code) => {
				if (code !== 0) {
					twokeys.logger.err(`Vagrant did not exit with code 0; exited with a code of ${code}`);
					return reject(new CodedError(
						`Vagrant exited with non-zero exit code of ${code}. 2Keys assumes this means vagrant had an error; please consult the logs for more info.`,
						BAD_VAGRANT_EXIT_CODE
					));
				} else {
					twokeys.logger.substatus("VM is now running and provisioned!");
					return resolve();
				}
			});
		}).catch(reject);
	});
}