// Executor
#[macro_use]
extern crate neon;
use neon::prelude::*;

extern crate winapi::um;


fn ahk_exec_NOT(ahk_path: String) -> JsResult<JsUndefined> {

	// Load lib
	let handle = libloaderapi::LoadLibraryW(&ahk_path);

}
