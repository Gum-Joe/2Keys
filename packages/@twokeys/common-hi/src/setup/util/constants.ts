import { join } from "path";
import getAssertsRoot from "../../util/get-common-hi-asserts-root";

export const SETUP_ASSETS_ROOT = join(getAssertsRoot(), "setup");
// Default Service prefix
export const WINDOWS_DAEMON_PREFIX = "2Keys-";
export const WINDOWS_DAEMON_FILE = "daemon.js";
export const WINDOWS_DAEMON_FILE_VBS = "daemon.vbs";
export const WINDOWS_DAEMON_FILE_JS_TEMPLATE = join(SETUP_ASSETS_ROOT, "daemon", WINDOWS_DAEMON_FILE);
export const WINDOWS_DAEMON_FILE_VBS_TEMPLATE = join(SETUP_ASSETS_ROOT, "daemon", WINDOWS_DAEMON_FILE_VBS);
export const WINDOWS_DAEMON_PID_FILE = "daemon.pid";
export const WINDOWS_SERVER_PID_FILE = "server.pid";

// Local project stuff
export const DEFAULT_LOCAL_2KEYS = ".2Keys";  // Where local 2Keys files are, i.e. windows service files