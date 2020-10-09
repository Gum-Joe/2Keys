import TwoKeys from "@twokeys/addons/src/module-interfaces/twokeys";
import { TwoKeys as TwoKeysFromCore } from "@twokeys/core/lib/twokeys";
import { expect } from "chai";

export const execute = async function (twokeys: TwoKeys<"executor">, config: any): Promise<void> {
	config.testValue = true;
	config.expect(twokeys).to.be.instanceOf(TwoKeys);
	config.expect(twokeys).to.be.instanceOf(TwoKeysFromCore); // Should inherit from core
	config.expect(twokeys).to.have.property("logger");
	config.expect(twokeys.logger.args.name).to.include("loading-test");

	if (config.hasProperties) {
		expect(twokeys.properties.projectDir).to.equal(__dirname);
	}
};