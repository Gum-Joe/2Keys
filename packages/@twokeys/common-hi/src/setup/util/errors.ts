/**
 * Error codes
 */
// TODO: More docs & troubleshooting advice
/** Config file already exists */
export const CONFIG_ALREADY_EXISTS = "EEXIST";
/** License not accepted */
export const DID_NOT_ACCEPT_LICENSE = "ENOLICENSE";
/** A network interface was not found */
export const NET_INTERFACE_NOT_FOUND = "INET_NOENT";
/** Too many IPv4 addresses found for 1 adapter, we can't handle this */
export const NET_TOO_MANY_ENTRIES = "INET_TOO_MANY";
/** Incorrectly formatted IPv4 address */
export const NET_INVALID_IPV4 = "INET_INVALID_IPV4";
/** Incorrectly formatted/unsafe network interface address */
export const NET_INVALID_INTERFACE_NAME = "INET_INVALID_OR_UNSAFE_NAME";
/** When IPV4 address was not set and is wrong */
export const NET_IPV4_NOT_SET = "INET_IPV4_NOT_SET";

/** Missing properties */
export const MISSING_PROPS = "MISSING_PROPS";