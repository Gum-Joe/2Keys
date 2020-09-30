import { Logger } from "@twokeys/core";
import { join } from "path";
import sinon from "sinon";
import { starter } from "../index";
import * as constants from "@twokeys/core/lib/constants";

const logger = new Logger({ name: "twokeys" });

const BASE_DIR = join(__dirname, "../../testing");

sinon.replace(constants, "TWOKEYS_MAIN_CONFIG_DEFAULT_PATH", join(BASE_DIR, "2KeysHome/config.yml"));
sinon.replace(constants, "TWOKEYS_CLIENTS_ROOT", join(BASE_DIR, "2KeysHome/client"));
sinon.replace(constants, "TWOKEYS_CLIENTS_CONFIG_ROOT", join(BASE_DIR, "2KeysHome/client"));


starter(join(BASE_DIR, "project")).catch(err => {
	logger.printError(err);
	process.exit(1);
});