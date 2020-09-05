/**
 * Indicates a package was not found in the __registry__
 */
export const ADDON_NOT_IN_REGISTRY = "ADDON_DB_ENOENT";
/** Indicates an addon file could not be loaded (may need reinstalling.  Add the FS error code after it, prefixed with a `:`*/
export const ADDON_LOAD_FAILURE = "ADDON_LOAD_FAIL";