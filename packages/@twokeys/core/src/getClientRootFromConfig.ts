import { TWOKEYS_CLIENT_STORAGE_ROOT } from "./constants";
import { join } from "path";

export default function getClientRootFromConfig(config: { id: string }): string {
	return join(TWOKEYS_CLIENT_STORAGE_ROOT, config.id);
}
