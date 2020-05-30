import { join } from "path";
import { Package, SOFTWARE_DOWNLOAD_TYPE_ZIP, Software } from "../src/util/interfaces";

export const SOFTWARE_REG_ROOT = join(__dirname, "non-mocha", "registry", "softwareTest");
export const REGISTRY_DIR = join(__dirname, "non-mocha", "registry");
export const EXECUTOR_TEST = join(__dirname, "non-mocha", "executor1");
export const testPackage: Package<"executor"> = {
	name: "test1",
	types: ["executor"],
	info: {
		version: "1.0.0",
		description: "A TEST",
		size: null,
	},
	entry: {
		executor: "./test.js",
	},
};

export const testSoftware: Software = {
	name: "ahk",
	url: "https://codeload.github.com/HotKeyIt/ahkdll-v2-release/zip/master",
	homepage: "https://autohotkey.org",
	downloadType: SOFTWARE_DOWNLOAD_TYPE_ZIP,
	executables: [
		{
			name: "AHK_DLL",
			path: "ahkdll-v2-release-master/x64w/AutoHotkey.dll",
			arch: "x64",
		}
	]
};

export const testSoftwareUninstalled: Software = {
	...testSoftware,
	name: "ahkUninstalled",
};

export const testSoftwareToUpdate: Software = {
	name: "ahkUpdated",
	url: testSoftware.url,
	homepage: testSoftware.homepage,
	downloadType: SOFTWARE_DOWNLOAD_TYPE_ZIP,
	noAutoInstall: true,
	executables: [
		{
			name: "AHK_DLL",
			path: "ahkdll-v2-release-master/x64a/AutoHotkey.dll",
			arch: "x64",
		},
		{
			// (doesn't actually exist, but serves to test things)
			name: "AHK_DLL_X16",
			userInstalled: false,
			path: "ahkdll-v2-release-master/arm/AutoHotkey.dll",
			arch: "arm",
		},
		// Deleted
		{
			// (doesn't actually exist, but serves to test things)
			name: "AHK_DLL_ARM_64",
			path: "ahkdll-v2-release-master/arm/AutoHotkey.dll",
			arch: "arm64",
		}
	]
};
export const testSoftwareUpdated: Software = {
	name: testSoftwareToUpdate.name,
	url: testSoftwareToUpdate.url + Math.random().toString(),
	homepage: testSoftwareToUpdate.homepage + Math.random().toString(),
	downloadType: SOFTWARE_DOWNLOAD_TYPE_ZIP, // Should not change
	noAutoInstall: false,
	executables: [
		{
			name: "AHK_DLL",
			path: "ahkdll-v2-release-master/x64w/AutoHotkey.dll", // Test path updates
			arch: "x64",
		},
		{
			// (doesn't actually exist, but serves to test things)
			name: "AHK_DLL_X16",
			// Also tests updates to these fields
			path: "ahk.exe", // testing for user Install updates
			userInstalled: true,
			arch: "x32",
			os: "linux",
		},
		// Deleted
		{
			// (doesn't actually exist, but serves to test things)
			name: "AHK_DLL_ARM_64",
			path: "ahkdll-v2-release-master/arm/AutoHotkey.dll",
			arch: "arm64",
		},
		// This is inserted
		{
			name: "AHK_DLL_INSERTED",
			path: "ahkdll-v2-release-master/Win32a/AutoHotkey.dll",
			arch: "x32",
		},
		// These is inserted & tests for userInstalled in INSERTs
		{
			name: "AHK_EXE_INSERTED",
			path: "ahk.exe",
			userInstalled: true,
			arch: "x32",
		},
		{
			name: "AHK_DLL_INSERTED_2",
			path: "ahkdll-v2-release-master/Win32a/AutoHotkey.dll",
			userInstalled: false,
			arch: "x32",
		},
	]
};
// Used for executables testing
export const testSoftwareExecutablesTest: Software = {
	...testSoftwareToUpdate,
	name: "ahkUpdatedExecutableFuncTesting",
};