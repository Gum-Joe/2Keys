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
	executables: [
		{
			name: "AHK_DLL",
			path: "ahkdll-v2-release-master/x64w/AutoHotkey.dll",
			arch: "x64",
		}
	]
};
export const testSoftwareUpdated: Software = {
	name: testSoftwareToUpdate + Math.random().toString(),
	url: testSoftwareToUpdate.url,
	homepage: testSoftwareToUpdate.homepage,
	downloadType: SOFTWARE_DOWNLOAD_TYPE_ZIP,
	executables: [
		{
			name: "AHK_DLL",
			path: "ahkdll-v2-release-master/x64w/AutoHotkey.dll",
			arch: "x64",
		},
		{
			name: "AHK_DLL_2",
			path: "ahkdll-v2-release-master/x64w/AutoHotkey.dll",
			arch: "x64",
		}
	]
};