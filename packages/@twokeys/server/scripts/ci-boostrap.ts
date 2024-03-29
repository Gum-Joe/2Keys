/**
 * Install @twokeys/executor-ahk into the test registry
 * @packageDocumentation
 */
import { Logger } from "@twokeys/core";
import { symlinkSync, writeFileSync } from "fs";
import mkdirp from "mkdirp";
import { basename, join } from "path";
import { MOCK_REGISTRY } from "../test/boostrapper";

const logger = new Logger({
	name: "ci",
});

const TARGET_ROOT = join(MOCK_REGISTRY, "node_modules/@twokeys");

const EXECUTOR_AHK = join(__dirname, "../../../../executors/@twokeys/executor-ahk");
const DETECTOR_DESKTOP = join(__dirname, "../../../../detectors/detector-desktop/controller");

logger.info("Linking in packages....");
mkdirp.sync(TARGET_ROOT);
logger.warn("Please ensure yarn has been ran before.");
logger.info(`Linking ${EXECUTOR_AHK} -> ${join(TARGET_ROOT, basename(EXECUTOR_AHK))}`);
symlinkSync(EXECUTOR_AHK, join(TARGET_ROOT, basename(EXECUTOR_AHK)));
logger.info(`Linking ${DETECTOR_DESKTOP} -> ${join(TARGET_ROOT, basename(DETECTOR_DESKTOP))}`);
symlinkSync(DETECTOR_DESKTOP, join(TARGET_ROOT, "detector-desktop"));

logger.info("Adding to package.json");

const registryJSONPath = join(MOCK_REGISTRY, "package.json");
const registryJSON = require(registryJSONPath);
const executorAHK = require(join(EXECUTOR_AHK, "package.json"));
const detectorDesktop = require(join(DETECTOR_DESKTOP, "package.json"));
registryJSON.dependencies = {
	...registryJSON.dependencies
};

registryJSON.dependencies[executorAHK.name] = executorAHK.version;
registryJSON.dependencies[detectorDesktop.name] = detectorDesktop.version;

writeFileSync(registryJSONPath, JSON.stringify(registryJSON));