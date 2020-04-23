// Router tests
import { expect } from "chai";
import request from "supertest";
import { app } from "../../src/index";
import fs from "fs";
import YAML from "yaml";
import { CONFIG_FILE, MOCK_KEYBAORD_NAME, MOCK_ROOT } from "../global/constants";
import { join } from "path";
import { promises as fsp } from "fs";
import { EvDevValues, Config } from "../../src/util/interfaces";

const agent = request.agent(app);

describe("/api test", () => {

	describe("/api/get/config", () => {
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
	});

	describe("/api/post/update-keyboard-path", () => {
		it("should successfully change keyboard path", (done) => {
			const testPath = "/dev/input/by-id/" + Math.random();
			agent
				.post("/api/post/update-keyboard-path")
				.expect(200)
				.send({
					keyboard: MOCK_KEYBAORD_NAME,
					path: testPath,
				})
				.end((err, res) => {
					if (err) { done(err); }
					// Delay, to account for time to execute
					setTimeout(() => {
						fsp.readFile(join(MOCK_ROOT, "./config.yml"))
							.then((contents) => {
								const config: Config = YAML.parse(contents.toString());
								expect(config.keyboards[MOCK_KEYBAORD_NAME].path).to.equal(testPath);
								done();
							})
							.catch(done);
					}, 100);
				});
		});
	})

	describe("/api/post/trigger", () => {
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
								expect(contents.toString()).to.equal("IT WORKED!");
								done();
							})
							.catch(done);

					}, 100);
				});
		});

		it("should sucessfully execute the down hotkey where key value is down (object multi type)", (done) => {
			agent
				.post("/api/post/trigger")
				.expect(200)
				.send({
					hotkey: "+C$END$",
					keyboard: MOCK_KEYBAORD_NAME,
					value: EvDevValues.Down,
				})
				.end((err, res) => {
					if (err) { done(err); }
					// Delay, to account for time to execute
					setTimeout(() => {
						fsp.readFile(join(MOCK_ROOT, "./RunTestForExecution4.txt"))
							.then((contents) => {
								expect(contents.toString()).to.equal("IT WORKED!");
								done();
							})
							.catch(done);
					}, 100);
				});
		});

		it("should sucessfully execute the up hotkey where key value is down (object multi type)", (done) => {
			agent
				.post("/api/post/trigger")
				.expect(200)
				.send({
					hotkey: "+C$END$",
					keyboard: MOCK_KEYBAORD_NAME,
					value: EvDevValues.Up,
				})
				.end((err, res) => {
					if (err) { done(err); }
					// Delay, to account for time to execute
					setTimeout(() => {
						fsp.readFile(join(MOCK_ROOT, "./RunTestForExecution3.txt"))
							.then((contents) => {
								expect(contents.toString()).to.equal("IT WORKED!");
								done();
							})
							.catch(done);
					}, 100);
				});
		});

		it("should not accept an incorrect value", (done) => {
			agent
				.post("/api/post/trigger")
				.expect(500)
				.send({
					hotkey: "+C$END$",
					keyboard: MOCK_KEYBAORD_NAME,
					value: 3, // This is wrong
				})
				.end((err, res) => {
					if (err) { done(err); }
					// Delay, to account for time to execute
					expect(res.text).to.include("TypeError: The request keyboard event value of 3 is invalid.");
					done();
				});
		});

		it("should ignore hotkeys where a function does not exist for a given value (object multi type)", (done) => {
			agent
				.post("/api/post/trigger")
				.expect(404)
				.send({
					hotkey: "+D$END$",
					keyboard: MOCK_KEYBAORD_NAME,
					value: EvDevValues.Down, // This is wrong
				})
				.end((err, res) => {
					if (err) { done(err); }
					// Delay, to account for time to execute
					expect(res.text).to.include("Hotkey function not found");
					done();
				});
		});
	});

	after(async () => {
		// Delete file
		await fsp.unlink(join(MOCK_ROOT, "./RunTestForExecution2.txt"));
		await fsp.unlink(join(MOCK_ROOT, "./RunTestForExecution3.txt"));
		await fsp.unlink(join(MOCK_ROOT, "./RunTestForExecution4.txt"));
		return;
	});

});
