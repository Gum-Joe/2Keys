/**
 * @license
 * Copyright 2020 Kishan Sambhi
 *
 * This file is part of 2Keys.
 *
 * 2Keys is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * 2Keys is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with 2Keys.  If not, see <https://www.gnu.org/licenses/>.
 */
/**
 * Error tests
 */

import { CodedError } from "../src/error";
import { expect } from "chai";

describe("CodedError tests", () => {
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