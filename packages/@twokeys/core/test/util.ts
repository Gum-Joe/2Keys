/* eslint-disable @typescript-eslint/no-unused-vars */
import { implementsStaticProperties } from "../src";

describe("Util tests", () => {
	describe("@implementsStaticProperties()", () => {
		// Compile test, since this works at compile time
		interface SomeStaticProperties {
			aProperty: boolean;
			bProperty: string;
		}
		it("successful compile case", () => {
			// This should compile fine
			@implementsStaticProperties<SomeStaticProperties>()
			class A {
				static aProperty = true;
				static bProperty = "a";
			}
			new A(); // So TS does not complain
		});

		it("failure to compile case (with @ts-expect-error)", () => {
			// THis should not be fine
			// @ts-expect-error
			@implementsStaticProperties<SomeStaticProperties>()
			class B {
				static aProperty = true;
			}
			new B(); // So TS does not complain
		});
	});
});