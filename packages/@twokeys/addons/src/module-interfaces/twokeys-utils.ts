import { Logger } from "@twokeys/core";
import path, { join } from "path";
import { Package, TWOKEYS_ADDON_TYPES } from "../util/interfaces";
import { promises as fs } from "fs";
import { platform } from "os";

/** Utils for {@link TwoKeys} */
export default class TwoKeysUtilites<AddOnsType extends TWOKEYS_ADDON_TYPES = TWOKEYS_ADDON_TYPES>  {
	public readonly package: Package<AddOnsType>;
	public readonly logger: Logger;
	
	constructor(packageObject: Package<AddOnsType>, protected readonly CustomLogger: typeof Logger = Logger) {
		this.logger = new this.CustomLogger({
			name: "utils",
		});
		this.package = packageObject;
	}

	// TNOTAODO Come up with a better way of tracking startup links.

	/**
	 * Gets path for symbolic link to startup.
	 * 
	 * Path is constructed as `startup_path\2Keys-add-on-<add-on name>-<filename>`
	 * 
	 * E.g: `C:\Users\SomeUser\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup\2Keys-add-on-@twokeys/detector-vm-launch.vbs`
	 * @param source Path to source that is being linked
	 */
	public getSymbolLinkPath(source: string): string {
		// Prevent OS error when testing on macOS (some tests have to run on macOS because GitHub Actions only allows Virtualbox on macOS)
		if (platform() === "win32") {
			const native = require("@twokeys/native-utils");
			return join(native.get_startup_folder(), `2Keys-add-on-${this.package.name}-${path.basename(source)}`);
		} else {
			throw new Error("This method is not supported on your OS platform!");
		}
	}

	/**
	 * Symbolicaly links a file to startup
	 * @param source Absolute path to source 
	 * @see TwoKeysUtilites.getsymbolLinkPath for how dest. path is made
	 */
	public symbolLinkToStartup(source: string): Promise<void> {
		const dest = this.getSymbolLinkPath(source);
		this.logger.info(`Symlinking ${source} into user startup folder...`);
		this.logger.debug(`Linking into ${dest}`);
		return fs.symlink(source, dest);
	}

	/**
	 * Deletes a symbolic link to a source
	 * @param soruce Original source provided to {@link TwoKeysUtilites.symbolLinkToStartup}
	 * @see TwoKeysUtilites.getsymbolLinkPath for how dest. path is made
	 */
	public deleteSymbolLinkTo(source: string): Promise<void> {
		const dest = this.getSymbolLinkPath(source);
		this.logger.info(`Removing symlinking to ${source} from user startup folder...`);
		this.logger.debug(`Deleting ${dest}`);
		return fs.unlink(dest);
	}
}