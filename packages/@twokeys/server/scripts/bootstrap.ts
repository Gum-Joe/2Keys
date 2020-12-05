// Runs OOBE for us for CI
import run_oobe from "../src/oobe";
import { Arguments } from "yargs";

// DO IT
run_oobe({
	force: true,
} as unknown as Arguments);
