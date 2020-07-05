import Logger from "../src/logger";
import chai, { expect } from "chai";
import Prompts from "../src/prompts";
import stream from "stream";
import chaiAsPromised from "chai-as-promised";
import { spawn } from "child_process";
import path from "path";

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
			//console.log("Setting _write...")
			theStream._write = function (chunk, encoding, done): void {
				/*console.log("GOT RES");
				console.log("START" + chunk.toString() + "END");*/
				let input = chunk.toString();
				if (input[input.length - 1] === "\n") {
					// Remove \n as readline would
					input = input.slice(0, input.length - 1);
				}
				resolve(input);
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
	it("logger should have propmts object", () => {
		const logger = new Logger({ name: "test" });
		expect(logger).to.haveOwnProperty("prompts");
		expect(logger.prompts).to.be.instanceOf(Prompts);
	});

	const [MockedPrompts, mockedStdinStream] = mockPrompts(Prompts);

	describe(".prompts.info() tests", () => {

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
	
	describe(".prompts.question() tests", () => {

		it("should let us specify a default option, and titlecase that, and then default to it", async () => {
			const [MockedPrompts, mockedStdinStream] = mockPrompts(Prompts);

			let messagePrinted = false;
			const logger = new Logger({
				name: "prompts", loggingMethods: {
					...console,
					log: (message: string) => {
						// CHeck for:
						// 1. The prompt message
						// 2. that we are using the info logger (which the calling of this method proves)
						if (message.includes("Do you wish to continue? [yes/No/maybe]")) {
							messagePrinted = true;
						}
					}
				}
			});
			const prompts = new MockedPrompts(logger);
			const promptPromise = prompts.question("Do you wish to continue?", {
				buttons: ["yes", "no", "maybe"],
				defaultButton: 1
			});
			expect(messagePrinted).to.be.true;
			mockedStdinStream.write("\n");

			await expect(promptPromise).to.eventually.deep.equal({
				response: 1,
			});
		});

		it("should be able to handle options with spaces in", async () => {
			const [MockedPrompts, mockedStdinStream] = mockPrompts(Prompts);

			let messagePrinted = false;
			const logger = new Logger({
				name: "prompts", loggingMethods: {
					...console,
					log: (message: string) => {
						// CHeck for:
						// 1. The prompt message
						// 2. that we are using the info logger (which the calling of this method proves)
						if (message.includes("Do you wish to continue?")) {
							expect(message).to.include("Do you wish to continue? [option a/Option B/option c]");
							messagePrinted = true;
						}
					}
				}
			});
			const prompts = new MockedPrompts(logger);
			const promptPromise = prompts.question("Do you wish to continue?", {
				buttons: ["Option A", "Option B", "Option C"],
				defaultButton: 1
			});
			expect(messagePrinted).to.be.true;
			mockedStdinStream.write("option c");

			await expect(promptPromise).to.eventually.deep.equal({
				response: 2,
			});
		});

		it("should continue asking for input until valid input given", async () => {
			const [MockedPrompts, mockedStdinStream] = mockPrompts(Prompts);

			let messagePrinted = false;
			let numberInvalidInputs = 0; // So we can track when invalidInput printed
			const targetInvalidInputs = 3; // No. times to enter invalid input
			const logger = new Logger({
				name: "prompts", loggingMethods: {
					...console,
					log: (message: string) => {
						//console.log(message);
						// Check for:
						// 1. The prompt message
						// 2. that we are using the info logger (which the calling of this method proves)
						if (message.includes("Please select a mode.")) {
							expect(message).to.include("Please select a mode. [o/m/C]");
							messagePrinted = true;
						} else if (message.includes("Invalid response")) {
							numberInvalidInputs += 1;
						}
					}
				}
			});
			const prompts = new MockedPrompts(logger);
			const promptPromise = prompts.question("Please select a mode.", {
				buttons: ["o", "m", "c"], // Overwrite, merge, cancel
				defaultButton: 2
			});
			expect(messagePrinted).to.be.true;
			// Test invalid inputs
			// HACK: Allow us to write one by one to prevent race conditions
			const writeToStdinPromise = (text) => {
				return new Promise((resolve, reject) => {
					mockedStdinStream.write(text, (err) => {
						if (err) {
							return reject(err);
						}
						resolve();
					});
				});
			};
			for (let i = 0; i < targetInvalidInputs; i++) await writeToStdinPromise("invalid input" + i);

			expect(numberInvalidInputs).to.equal(numberInvalidInputs); // Check if all invalid inputs processed

			// Now test correct one
			mockedStdinStream.write("C");
			await expect(promptPromise).to.eventually.deep.equal({
				response: 2,
			});
		});

		it("should ask a simple question, and provide the right response when give", (done) => {
			// Here we test different ways of typing in "y" and "n" in different cases and checking the right response comes back
			// these are the default response options (see Prompts.YES_NO)
			const options = [
				// [option to provide as input, index in the array of options (see Prompts.YES_NO) that has been entered]
				["y", 0],
				["Y", 0],
				["n", 1],
				["N", 1]
			];
			for (const [optionToEnter, indexOfResponse] of options) {
				const [MockedPrompts, mockedStdinStream] = mockPrompts(Prompts);
				
				let messagePrinted = false;
				const logger = new Logger({
					name: "prompts", loggingMethods: {
						...console,
						log: (message: string) => {
							// CHeck for:
							// 1. The prompt message
							// 2. that we are using the info logger (which the calling of this method proves)
							if (message.includes("Do you wish to continue? [y/n]")) {
								messagePrinted = true;
							}
						}
					}
				});
				const prompts = new MockedPrompts(logger);
				let isPending = true; // HACK: Hack to get promise state

				const promptPromise = prompts.question("Do you wish to continue?")
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
					mockedStdinStream.write(optionToEnter);
					// Wait to be done
					expect(promptPromise).to.be.eventually.deep.equal({
						response: indexOfResponse,
					}).then(() => {
						if (optionToEnter === options[options.length - 1][0]) {
							done();
						}
					});
				}, 500);
			}
		}).timeout(5000);
	});

	describe(".prompts.warning() tests (NOTE: most test case covered in .prompts.question() tests)", () => {
		it("should use the warning logger when printing", (done) => {
			const [MockedPrompts, mockedStdinStream] = mockPrompts(Prompts);
			let messagePrinted = false;
			const logger = new Logger({
				name: "prompts", loggingMethods: {
					...console,
					warn: (message: string) => {
						if (message.includes("Do you wish to continue?")) {
							expect(message).to.include("Do you wish to continue? [proceed/halt]");
							messagePrinted = true;
						}
					}
				}
			});
			const prompts = new MockedPrompts(logger);
			const promptPromise = prompts.warning("Do you wish to continue?", { buttons: ["proceed", "halt"] });
			expect(messagePrinted).to.be.true;
			mockedStdinStream.write("proceed");
			expect(promptPromise).to.eventually.deep.equal({
				response: 0,
			}).notify(done);
		});

		it("should use the default y/n when no config given", (done) => {
			const [MockedPrompts, mockedStdinStream] = mockPrompts(Prompts);
			let messagePrinted = false;
			const logger = new Logger({
				name: "prompts", loggingMethods: {
					...console,
					warn: (message: string) => {
						if (message.includes("Do you wish to continue?")) {
							expect(message).to.include("Do you wish to continue? [y/n]");
							messagePrinted = true;
						}
					}
				}
			});
			const prompts = new MockedPrompts(logger);
			const promptPromise = prompts.warning("Do you wish to continue?");
			expect(messagePrinted).to.be.true;
			mockedStdinStream.write("y");
			expect(promptPromise).to.eventually.deep.equal({
				response: 0,
			}).notify(done);
		});
	});

	describe("Readline test", () => {
		// HACK: We just spawn a process and write to STDIN, it's easiest to do.
		// NOTE: If the test is hanging, check that "Done with test" is outputted, as tjis determines if done() should be called or not.
		it("should take input and resolve the promise", (done) => {
			// NOTE: May break if ts-node changes path location
			const proc = spawn(
				"node",
				[path.join(__dirname, "./non-mocha/call-readline.js")],
				{
					env: {
						TWOKEYS_USE_COLOUR: "false",
					}
				}
			);
			proc.stdout.on("data", (chunk) => {
				if (chunk.toString().includes("Press enter to continue.")) {
					proc.stdin.write("\n");
				} else if (chunk.toString().includes("Done with test")) {
					done();
				}
			});
			proc.stderr.on("data", (chunk) => {
				console.error(chunk.toString());
			});
			proc.on("close", (code) => {
				if (code !== 0) {
					done(new Error(`Child process exited with code ${code}!`));
				}
			});
		}).timeout(20000);
	});
});