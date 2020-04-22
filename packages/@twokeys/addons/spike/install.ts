/**
 * Spike install
 */
import { join } from "path";
import AddOnsRegistry from "../src/registry";
const directory = join(__dirname, "test");

AddOnsRegistry.createNewRegistry(directory)
	.then(() => {
		const reg = new AddOnsRegistry(directory);
		reg.install("mkdirp")
			.catch((err) => { console.log(err.stack); });
	})
	.catch((err) => {
		throw err;
	});

