import Logger from "../src/logger";
import chai, { expect } from "chai";
import Prompts from "../src/prompts";
import stream from "stream";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);

/**
 * Helper function to mock getInputPromise()
 * @param prompts Prompts constrcutor
 * @returns the modifed prompts oibject, and a WritableStream to use to provide STDIN with
 */
function mockPrompts(prompts: typeof Prompts): [typeof Prompts, stream.Writable] {
	const theStream = new stream.Writable();
	prompts.getInputPromise = (question = ""): Promise<string> => {
		// HACK: Whenever this is called, we chane the variable theStream above with the new reading stream
		// This is bad practise as it means stream can be invalid, but it works
		return new Promise((resolve) => {
			theStream._write = function (chunk, encoding, done): void {
				resolve(chunk.toString());
				done();
			};
		}); 
	};
	return [prompts, theStream];
}

/**
 * Tests for prompts.ts
 */
describe("Prompts test (prompts.ts)", () => {
	it("logger should have propmpts object", () => {
		const logger = new Logger({ name: "test" });
		expect(logger).to.haveOwnProperty("prompts")
		expect(logger.prompts).to.be.instanceOf(Prompts);
	});

	describe(".prompts.info() tests", () => {

		/** Function to mock the logger for us, replacing .prompts.get */

		it("should hold until enter hit, and the user is prompted for this", (done) => {
			let messagePrinted = false;
			const logger = new Logger({
				name: "prompts", loggingMethods: {
					...console,
					log: (message: string) => {
						// CHeck for "Press enter to continue"
						if (message.includes("Press enter to continue")) {
							messagePrinted = true;
						}
					}
				}
			});
			const [MockedPrompts, mockedStdinStream] = mockPrompts(Prompts);
			const prompts = new MockedPrompts(logger);
			let isPending = true; // HACK: Hack to get promise state

			const promptPromise = prompts.info("IMPORTANT! Read this.")
				.then((response) => {
					isPending = false;
					return response;
				});
			// Check if message printed
			expect(messagePrinted).to.be.true;
			// Check for status after  1 sec: not yet fulfilled
			setTimeout(() => {
				expect(isPending).to.be.true;
			}, 500);
			// After 2 sec, write to mock stdin, then should be fulfilled
			setTimeout(() => {
				mockedStdinStream.write("\n");
				// Wait to be done
				expect(promptPromise).to.be.eventually.fulfilled.notify(done);
			}, 500);
		}).timeout(5000);
	});
});