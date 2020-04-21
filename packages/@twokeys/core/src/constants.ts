/**
 * Constants
 */
import { join } from "path";

/** Default location of 2Keys project config (see interface {@link ServerConfig}) */
export const CONFIG_DEFAULT_FILE_SERVER = join(process.env.APPDATA, "2Keys", "2Keys.yml");
