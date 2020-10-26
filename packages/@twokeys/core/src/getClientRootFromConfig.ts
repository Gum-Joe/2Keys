import { TWOKEYS_CLIENT_STORAGE_ROOT } from "./constants";
import { join } from "path";

/**
 * Gets the path to the global folder where clients should store files (e.g. global config files, client SSH keys, etc)
 * @param config Config of the client
 * @returns Path to storage folder for client
 */
// NOTE: Not tested, since by testign it we'd be enforcing implementation details
export default function getClientRootFromConfig(config: { id: string }): string {
	return join(TWOKEYS_CLIENT_STORAGE_ROOT, config.id);
}
