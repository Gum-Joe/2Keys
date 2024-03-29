import { createMockTwoKeys, AddOnsRegistry, TWOKEYS_ADDON_TYPE_DETECTOR, SoftwareRegistry } from "@twokeys/addons";
import { TwoKeys } from "@twokeys/addons";
import { MOCK_REGISTRY_LOCATION, MOCK_ROOT, MOCK_CLIENT_LOCATION } from "../test/constants";

import packageJSON from "../package.json";

//import install from "../src/install";
import newClient from "../src/setup/client/newClient";


const twokeys = createMockTwoKeys(packageJSON, new AddOnsRegistry(MOCK_REGISTRY_LOCATION).registryDBFilePath, {
	projectDir: MOCK_ROOT,
	clientRoot: MOCK_CLIENT_LOCATION }) as unknown as TwoKeys<TWOKEYS_ADDON_TYPE_DETECTOR>;

/*(async function (): Promise<void> {
	await AddOnsRegistry.createNewRegistry(MOCK_REGISTRY_LOCATION);
	await SoftwareRegistry.createSoftwareRegistry(MOCK_REGISTRY_LOCATION);
	// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
	// @ts-ignore
	await install(twokeys);
})();*/

(async function (): Promise<void> {
	await AddOnsRegistry.createNewRegistry(MOCK_REGISTRY_LOCATION);
	await SoftwareRegistry.createSoftwareRegistry(MOCK_REGISTRY_LOCATION);
	// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
	// await install(twokeys);
	// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
	// @ts-ignore 
	await newClient(twokeys, {
		id: "sodkfhakjshdf",
		name: "test",
		controller: "@twokeys/detector-desktop",
		controllerConfig: {
			perms: {
				addToStartup: false,
				allowAutoUpdate: false,
			},
			keyboards: [], // TODO
			projects: [],
			executables: {},
		}
	});
})();