// Router tests
import { expect } from "chai";
import request from "supertest";
import { app } from "../../src/index";
import fs from "fs";
import YAML from "yaml";
import { CONFIG_FILE } from "../global/constants";

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

});
