// Router tests
import { expect } from "chai";
import request from "supertest";
import { app } from "../../src/index";
import fs from "fs";
import YAML from "yaml";
import { CONFIG_FILE, MOCK_KEYBAORD_NAME, MOCK_ROOT } from "../global/constants";
import { join } from "path";
import { promises as fsp } from "fs";

const agent = request.agent(app);

describe("/api test", () => {

	it("should send back a copy of the config", (done) => {
		const config = fs.readFileSync(CONFIG_FILE);
		agent
			.get("/api/get/config")
			.expect(200)
			.end((err, res) => {
				if (err) { done(err); }
				expect(res.body).to.deep.equal(YAML.parse(config.toString()));
				done();
			});
	});

	it("should successfully execute a hotkey", (done) => {
		agent
			.post("/api/post/trigger")
			.expect(200)
			.send({
				hotkey: "+^B",
				keyboard: MOCK_KEYBAORD_NAME,
			})
			.end((err, res) => {
				if (err) { done(err); }
				// Delay, to account for time to execute
				setTimeout(() => {
					fsp.readFile(join(MOCK_ROOT, "./RunTestForExecution2.txt"))
						.then((contents) => {
							expect(contents.toString(), done).to.equal("IT WORKED!");
							done();
						})
						.catch(done);

				}, 100);
			});
	});

	after(async () => {
		// Delete file
		await fsp.unlink(join(MOCK_ROOT, "./RunTestForExecution2.txt"));
	});

});
