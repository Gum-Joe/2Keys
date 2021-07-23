/**
 * Tasks
 */
import exec from "gulp-exec";
import gulp, { watch } from "gulp";
import path, { join } from "path";
import { pbjs, pbts } from "protobufjs/cli";
import { promisify } from "util";

const PROTOC_GEN_TS_PATH = ".\\node_modules\\.bin\\protoc-gen-ts.cmd";
const OUT_DIR = "src";
const SOURCE_DIR_RELATIVE = "src";
const SOURCE_DIR = path.join(__dirname, SOURCE_DIR_RELATIVE);
const SOURCE_GLOB = "**/*.proto";

const NEW_OUT_DIR = "bundled";
const OUT_FILE = join(NEW_OUT_DIR, "protobuf/compiled.js");
const OUT_FILE_TS = join(NEW_OUT_DIR, "protobuf/compiled.d.ts");

/**
 * OLD Protobuf compiler
 * @deprecated in favour of protobufjs as it provides verify methods
 */
export async function protocOld(): Promise<void> {
	return gulp.src(path.join(SOURCE_DIR, SOURCE_GLOB))
		.pipe(exec(file => {
			const command = `
			protoc
			--plugin="protoc-gen-ts=${PROTOC_GEN_TS_PATH}"
			--js_out="import_style=commonjs,binary:${OUT_DIR}"
			--ts_out="${OUT_DIR}"
			-I ${SOURCE_DIR}
			${file.path}
			`;
			return command.split("\n").join(" ").replace(/\t/g, "");
		}))
		.pipe(exec.reporter());
}

export async function protoc(): Promise<void> {
	await promisify(pbjs.main)([
		"-t",
		"static-module",
		"-w",
		"commonjs",
		"-o",
		OUT_FILE,
		path.join(SOURCE_DIR, SOURCE_GLOB)
	]);
	await promisify(pbts.main)([
		"-o",
		OUT_FILE_TS,
		OUT_FILE
	]);
}


gulp.task("protoc:watch", async () => {
	return watch(SOURCE_DIR_RELATIVE + "/" + SOURCE_GLOB, protoc);
});
