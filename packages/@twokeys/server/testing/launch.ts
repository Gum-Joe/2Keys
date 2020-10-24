import { Logger } from "@twokeys/core";
import { join } from "path";
import sinon from "sinon";
import { starter } from "../src/index";
import * as constants from "@twokeys/core/lib/constants";

const logger = new Logger({name: "twokeys"});

sinon.replace(constants, "TWOKEYS_MAIN_CONFIG_DEFAULT_PATH", join(__dirname, "2KeysHome/config.yml"));
sinon.replace(constants, "TWOKEYS_CLIENTS_ROOT", join(__dirname, "2KeysHome/client"));
sinon.replace(constants, "TWOKEYS_CLIENTS_CONFIG_ROOT", join(__dirname, "2KeysHome/client"));


starter(join(__dirname, "project")).catch(err => { 
	logger.printError(err);
	process.exit(1);
});