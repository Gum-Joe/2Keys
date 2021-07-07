import { compileFromFile } from "json-schema-to-typescript";
import { promises as fs } from "fs";
import fg from "fast-glob";
import { basename, join, parse } from "path";

const SCHEMA_SOURCE = "./src/*.json";
//const SCHEMA_GLOB = "*.json";
const OUTPUT = "types";
const THIS_DETECTOR = "detector-pi" // TODO: Change to detector-desktop when copied
const PYTHON_SCHEMAS_OUTPUT_DIR = join(__dirname, "../../", THIS_DETECTOR, "detector/twokeys/assets/schemas"); // Used to output python schemas

export async function compileSchemas() {
	//const sourceContents = await fs.readdir(SCHEMA_SOURCE);
	const files = await fg(SCHEMA_SOURCE);
	const promises = files.map(async (file) => {
		// Compile it!
		const compiled = await compileFromFile(file);
		return fs.writeFile(join(OUTPUT, parse(file).name + ".ts"), compiled);
	});

	return Promise.all(promises);
}

export async function copySchemas() {
	const files = await fg(SCHEMA_SOURCE);
	const promises = files.map(async (file) => {
		// Compile it!
		return fs.writeFile(join(PYTHON_SCHEMAS_OUTPUT_DIR, basename(file)), await fs.readFile(file));
	});

	return Promise.all(promises);
}

export async function buildSchemas() {
	await compileSchemas();
	await copySchemas();
}