import { watch } from "fs";
import { join } from "path";
import { DetectorConfig, ProjectConfig } from "@twokeys/core/lib/interfaces";
import { loadClientConfig, loadDetectorConfig } from "@twokeys/core/lib/config";
import { TWOKEYS_CLIENTS_CONFIG_ROOT } from "@twokeys/core/lib/constants";
import { getClientConfigPath, getClientRootFromConfig, Logger } from "@twokeys/core";
import { AddOnsRegistry } from "@twokeys/addons";

export const logger: Logger = new Logger({
	name: "config",
});


export async function loadDetectors(projectConfig: ProjectConfig, projectDir: string, registry: AddOnsRegistry): Promise<Map<string, DetectorConfig>> {
	logger.info("Loading detectors...");
	const detectors = new Map<string, DetectorConfig>();

	logger.info("Listing detectors & generating map...");
	logger.info("Detector configs will auto reload on change");
	await Promise.all(projectConfig.detectors.map(async (detectorConfigPath) => {
		logger.debug("Loading a detector config...");
		const absoluteDetectorConfigPath = join(projectDir, detectorConfigPath);
		const detector = await loadDetectorConfig(absoluteDetectorConfigPath);
		detectors.set(detector.name, detector);

		logger.debug("Watching for changes");
		watch(absoluteDetectorConfigPath, { persistent: false }, () => {
			logger.info(`Changes detected to detector ${detector.name}! Reloading`);
			loadDetectorConfig(absoluteDetectorConfigPath)
				.then((newDetector) => {
					detectors.set(newDetector.name, newDetector);
					if (detector && (newDetector.name !== detector.name)) { // Detector may have been deleted from memeory, hence
						// Detector name change!
						logger.debug(`Detected a name change of detector ${detector.name} to ${newDetector.name}!`);
						detectors.delete(detector.name);
					}
				})
				.catch(err => {
					logger.err(`Error reloading detector ${detector.name}!`);
					logger.printError(err);
					// What else to do?
					throw err;
				});
		});
		return detector;
	}));

	logger.debug("Running startup actions...");
	const actionPromises: Array<Promise<void>> = [];
	for (const [detectorName, detectorConfig] of detectors.entries()) {
		logger.debug(`Adding startup task for ${detectorName}`);
		actionPromises.push((async (): Promise<void> => {
			logger.debug(`Loading client config for client ${detectorConfig.client.name}...`);
			const client = await loadClientConfig(getClientConfigPath(TWOKEYS_CLIENTS_CONFIG_ROOT, detectorConfig.client.id));
			const controller = await registry.loadDetector(client.controller, {
				projectDir,
				clientRoot: getClientRootFromConfig(client)
			});
			if (typeof controller.startup === "function") {
				logger.info(`Running startup actions for client ${client.name}, which has detector ${detectorName}`);
				await controller.call(controller.startup, {
					clientConfig: client,
					projectConfig,
					detectorConfig,
				});
			}
		})()); // Must call it so it is ran
	}
	logger.debug("Waiting for startup actions to finish...");
	await Promise.all(actionPromises);

	return detectors;
}
