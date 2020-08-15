/**
 * Tasks
 */
import exec from "gulp-exec";
import gulp, { watch } from "gulp";
import path from "path";

const PROTOC_GEN_TS_PATH = ".\\node_modules\\.bin\\protoc-gen-ts.cmd";
const OUT_DIR = "src";
const SOURCE_DIR_RELATIVE = "src";
const SOURCE_DIR = path.join(__dirname, SOURCE_DIR_RELATIVE);
const SOURCE_GLOB = "**/*.proto";

export async function protoc() {
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


gulp.task("protoc:watch", async () => {
	return watch(SOURCE_DIR_RELATIVE + "/" + SOURCE_GLOB, protoc);
});