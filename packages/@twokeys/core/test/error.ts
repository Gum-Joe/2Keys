/**
 * Erro test
 */

import { CodedError } from "../src/error";
import { expect } from "chai";

describe("CodedError Test", () => {
	it("should have an error code", () => {
		expect(new CodedError("HI", "ECODE")).to.deep.include({ message: "ECODE: HI", code: "ECODE" });
	});
	it("should have the message as only the code if non provided", () => {
		expect(new CodedError(undefined, "ECODE")).to.deep.include({ message: "ECODE", code: "ECODE" });
	});
	it("should have the message only if no code given", () => {
		expect(new CodedError("A message")).to.deep.include({ message: "A message", code: undefined });
	});
});