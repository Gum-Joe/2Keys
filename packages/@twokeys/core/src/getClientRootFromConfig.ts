import { TWOKEYS_CLIENT_STORAGE_ROOT } from "@twokeys/core/lib/constants";
import { join } from "path";
import { ClientConfig } from "@twokeys/core/lib/interfaces";

export default function getClientRootFromConfig(config: { id: string }): string {
	return join(TWOKEYS_CLIENT_STORAGE_ROOT, config.id);
}
