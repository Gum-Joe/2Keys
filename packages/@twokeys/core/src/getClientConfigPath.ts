import { join } from "path";

/** Gets path to client config */

export default function getClientConfigPath(root: string, uuid: string): string {
	return join(root, `client-${uuid}.yml`);
}
