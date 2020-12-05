import { join } from "path";

/**
 * Gets path to a client config that is stored in `root`, where root is likely the client config storage folder
 * @param root Root storage location of client configs
 * @param uuid UUID of the client
 */
export default function getClientConfigPath(root: string, uuid: string): string {
	return join(root, `client-${uuid}.yml`);
}
