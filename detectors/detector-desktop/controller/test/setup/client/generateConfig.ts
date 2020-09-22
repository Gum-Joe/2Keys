import { expect } from "chai";
import generateConfig from "../../../src/setup/client/generateConfig";
import { twokeys } from "../../constants";



describe("Config generation tests", () => {
	it("should just return config", async () => {
		expect(await generateConfig(twokeys, {
			a: "a"
		})).to.deep.equal({ a: "a" });
	});
});