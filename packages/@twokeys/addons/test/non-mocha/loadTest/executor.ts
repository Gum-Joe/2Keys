import TwoKeys from "@twokeys/addons/src/module-interfaces/twokeys";

export const execute = async function (twokeys: TwoKeys, config): Promise<void> {
	config.testValue = true;
	config.expect(twokeys).to.have.property("logger");
	config.expect(twokeys.logger.args.name).to.include("loading-test");
};