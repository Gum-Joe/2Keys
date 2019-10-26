// Router tests
import { expect } from "chai";
import request from "supertest";
import api from "../../src/routes/api";
import { promises as fs } from "fs";
import { join } from "path";
import { CONFIG_FILE } from "../global/constants";

const agent = request.agent(api);

describe("/api test", () => {

	it("should send back a copy of the config", async () => {
		const config = await fs.readFile(CONFIG_FILE);
		agent
			.get("/get/config")
			.expect(200)
			.end((err, res) => {
				if (err) { throw err; }
				expect(res.body).to.equal(config);
			});
	});

});
