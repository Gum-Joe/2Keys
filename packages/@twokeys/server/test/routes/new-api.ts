import request from "supertest";
import chai from "chai";
import { join } from "path";
import server from "../../src";
import { DEFAULT_LOCAL_2KEYS, WINDOWS_SERVER_PID_FILE } from "../../src/util/constants";
import { MOCK_KDB_ROOT, MOCK_PROJECT_ROOT, MOCK_ROOT } from "../boostrapper";
import { loadDetectorConfig, loadProjectConfig } from "@twokeys/core/lib/config";
import {  promises as fs } from "fs";
import { expect } from "chai";
import sinon from "sinon";
import { constants } from "@twokeys/core";
import { promisify } from "util";
import * as triggerHotkey from "../../src/routes/triggerHotkey";
import { HotkeyTypeSingle } from "@twokeys/core/lib/interfaces";
import chaiAsPromised from "chai-as-promised";

let agent: request.SuperAgentTest;

chai.use(chaiAsPromised);


describe("New API tests", () => {
	before(async () => {
		sinon.replace(constants, "TWOKEYS_MAIN_CONFIG_DEFAULT_PATH", join(MOCK_ROOT, "2KeysHome/config.yml"));
		sinon.replace(constants, "TWOKEYS_CLIENTS_ROOT", join(MOCK_ROOT, "2KeysHome/client"));
		sinon.replace(constants, "TWOKEYS_CLIENTS_CONFIG_ROOT", join(MOCK_ROOT, "2KeysHome/client"));
		//await boostrapper();
		agent = request.agent(await server(9198, {
			"pid-file": join(MOCK_PROJECT_ROOT, DEFAULT_LOCAL_2KEYS, WINDOWS_SERVER_PID_FILE)
		}, MOCK_PROJECT_ROOT, await loadProjectConfig(MOCK_PROJECT_ROOT)));
	});

	describe("/api/get/config/project", () => {
		it("should send back config", (done) => {
			loadProjectConfig(MOCK_PROJECT_ROOT)
				.then((config) => {
					agent
						.get("/api/get/config/project")
						.expect(200)
						.end((err, res) => {
							if (err) { done(err); }
							expect(res.body).to.deep.equal(config);
							done();
						});
				})
				.catch(done);
		});
	});

	describe("/get/config/detectors/:detector", () => {
		it("should send back right detector config", (done) => {
			loadDetectorConfig(join(MOCK_PROJECT_ROOT, "detector-test.yml"))
				.then((config) => {
					agent
						.get(`/api/get/config/detectors/${config.name}`)
						.expect(200)
						.end((err, res) => {
							if (err) { done(err); }
							expect(res.body).to.deep.equal(config);
							done();
						});
				})
				.catch(done);
		});
		it("should send back an error when detector not found", (done) => {
			agent
				.get("/api/get/config/detectors/NOTADETECTOR")
				.expect(404)
				.end((err, res) => {
					if (err) { done(err); }
					expect(res.body).to.deep.equal({
						message: "Not Found"
					});
					done();
				});
		});
		it("should handle the case where nothing is sent", (done) => {
			agent
				.get("/api/get/config/detectors/%00")
				.expect(404)
				.end((err, res) => {
					if (err) { done(err); }
					expect(res.body).to.deep.equal({
						message: "Not Found"
					});
					done();
				});
		});
	});

	describe("/post/trigger/:detector/:keyboard", () => {
		it("should return 422 when an invalid post body is sent", (done) => {
			agent
				.post("/api/post/trigger/someDetector/someKDB")
				.expect(422)
				.end((err, res) => {
					if (err) { done(err); }
					expect(res.body).to.deep.equal({
						message: "Invalid POST body! Properties were missing!"
					});
					done();
				});
		});
		it("should return 422 when  the hotkey proeprty is missing from the body", (done) => {
			agent
				.post("/api/post/trigger/someDetector/someKDB")
				.send({ event: "down" })
				.expect(422)
				.end((err, res) => {
					if (err) { done(err); }
					expect(res.body).to.deep.equal({
						message: "Invalid POST body! Properties were missing!"
					});
					done();
				});
		});
		it("should not accept an invalid event field", (done) => {
			agent
				.post("/api/post/trigger/someDetector/someKDB")
				.send({ hotkey: "^A", event: "NOT AN EVENT" })
				.expect(422)
				.end((err, res) => {
					if (err) { done(err); }
					expect(res.body).to.deep.equal({
						message: "Bad event field given!"
					});
					done();
				});
		});

		it("should return 404 when triggering a detector or hotkey that was not found", (done) => {
			agent
				.post("/api/post/trigger/someDetector/someKDB")
				.send({ hotkey: "^A" })
				.expect(404)
				.end((err, res) => {
					if (err) { done(err); }
					expect(res.body).to.deep.equal({
						message: "Detector Not Found"
					});
					done();
				});
		});

		it("should return 404 when a keyboard is not found", (done) => {
			agent
				.post("/api/post/trigger/Test Detector/someKDB")
				.send({ hotkey: "^A" })
				.expect(404)
				.end((err, res) => {
					if (err) { done(err); }
					expect(res.body).to.deep.equal({
						message: "Keyboard Not Found"
					});
					done();
				});
		});

		it("should return 404 when a hotkey is not found", (done) => {
			agent
				.post("/api/post/trigger/Test Detector/keyboard_1")
				.send({ hotkey: "NotAHotkey" })
				.expect(404)
				.end((err, res) => {
					if (err) { done(err); }
					expect(res.body).to.deep.equal({
						message: "Hotkey Not Found"
					});
					done();
				});
		});

		it("should return 422 when a hotkey event type is not found", (done) => {
			agent
				.post("/api/post/trigger/Test Detector/keyboard_1")
				.send({ hotkey: "+C", event: "hold" })
				.expect(422)
				.end((err, res) => {
					if (err) { done(err); }
					expect(res.body).to.deep.equal({
						message: "Hotkey event type hold not found"
					});
					done();
				});
		});

		it("should execute", async () => {
			await new Promise((resolve, reject) => agent
				.post("/api/post/trigger/Test Detector/keyboard_1")
				.send({ hotkey: "^T" })
				.expect(200)
				.end((err) => {
					if (err) {
						return reject(err);
					}
					resolve();
				}));
			// Wait some time so it executes, then check
			await promisify(setTimeout)(100);
			expect((await fs.readFile(join(MOCK_KDB_ROOT, "RunTestForExecution1.txt"))).toString()).to.equal("IT WORKED!");
		});

		it("should execute a hotkey of a certain event type", async () => {

			await new Promise((resolve, reject) => agent
				.post("/api/post/trigger/Test Detector/keyboard_1")
				.send({ hotkey: "^B", event: "up" })
				.expect(200)
				.end((err) => {
					if (err) {
						return reject(err);
					}
					resolve();
				}));
			// Wait some time so it executes, then check
			await promisify(setTimeout)(100);
			expect((await fs.readFile(join(MOCK_KDB_ROOT, "RunTestForExecution2.txt"))).toString()).to.equal("IT WORKED!");
			
		});

		it("should execute a hotkey, ignoring event type if none are set in config", async () => {
			//console.log(JSON.stringify(await loadDetectorConfig(join(MOCK_PROJECT_ROOT, "detector-test.yml"))));
			await new Promise((resolve, reject) => agent
				.post("/api/post/trigger/Test Detector/keyboard_1")
				.send({ hotkey: "^T3", type: "hold" })
				.expect(200)
				.end((err) => {
					if (err) {
						return reject(err);
					}
					resolve();
				}));
			// Wait some time so it executes, then check
			await promisify(setTimeout)(100);
			expect((await fs.readFile(join(MOCK_KDB_ROOT, "RunTestForExecution3.txt"))).toString()).to.equal("IT WORKED!");
		});

		it("should execute a hotkey and use default executor if non specified in config", async () => {
			await new Promise((resolve, reject) => agent
				.post("/api/post/trigger/Test Detector/keyboard_1")
				.send({ hotkey: "^T4" })
				.expect(200)
				.end((err) => {
					if (err) {
						return reject(err);
					}
					resolve();
				}));
			// Wait some time so it executes, then check
			await promisify(setTimeout)(100);
			expect((await fs.readFile(join(MOCK_KDB_ROOT, "RunTestForExecution4.txt"))).toString()).to.equal("IT WORKED!");
		});

		it("should fail to execute when an executor is not present", async () => {
			const theConfig = (await loadDetectorConfig(join(MOCK_PROJECT_ROOT, "detector-test.yml")));
			expect(triggerHotkey.executeHotKey(
				theConfig.keyboards.keyboard_1.hotkeys["^NOT"] as HotkeyTypeSingle,
				"^NOT",
				theConfig.keyboards.keyboard_1,
				{},
			)).to.be.rejectedWith("ENOENT");
		});

	});

	after(() => sinon.restore());
	after(async () => {
		await fs.unlink(join(MOCK_KDB_ROOT, "RunTestForExecution1.txt"));
		await fs.unlink(join(MOCK_KDB_ROOT, "RunTestForExecution2.txt"));
		await fs.unlink(join(MOCK_KDB_ROOT, "RunTestForExecution3.txt"));
		await fs.unlink(join(MOCK_KDB_ROOT, "RunTestForExecution4.txt"));
	});
});