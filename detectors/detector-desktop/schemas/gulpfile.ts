import { compileFromFile } from "json-schema-to-typescript";
import { promises as fs } from "fs";
import fg from "fast-glob";
import { join, parse } from "path";

const SCHEMA_SOURCE = "./src/*.json";
//const SCHEMA_GLOB = "*.json";
const OUTPUT = "types";

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