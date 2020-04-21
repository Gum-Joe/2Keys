/** Declare our own env vars */

declare namespace NodeJS {
	export interface ProcessEnv {
		APPDATA: string; // Safe because this is windows only
	}
}