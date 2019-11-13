#[macro_use]
extern crate neon;
extern crate winapi;
extern crate widestring;

use neon::prelude::*;
use winapi::um::libloaderapi::*;
use winapi::um::winnt::*;
use winapi::shared::minwindef::DWORD;
use widestring::WideCString;
use std::ffi::CString;
use std::os::raw::c_char;
use std::{thread, time};

unsafe fn ahk_exec(ahk_path: String, code_to_exec: String) {

    println!("HI");
    println!("{}", ahk_path);
    println!("{}", code_to_exec);

    // Type defs
    let ahkdll: extern "stdcall" fn(
        winapi::shared::ntdef::LPTSTR,
        winapi::shared::ntdef::LPTSTR, 
        winapi::shared::ntdef::LPTSTR
    ) -> u8 ;
    let ahkready: extern "stdcall" fn() -> i8;
    let ahkexec: extern "stdcall" fn(
        winapi::shared::ntdef::LPTSTR
    ) -> i8;

	// Load lib
    // let ptr_ahk_path: *const u16 = ahk_path.as_ptr();
    let handle = LoadLibraryW(WideCString::from_str(ahk_path).unwrap().as_ptr());
    if (handle as DWORD) == 0 {
        let err = winapi::um::errhandlingapi::GetLastError();
        println!("ERROR!");
        println!("Code: {}", err);
    }
    println!("{}", handle as winapi::shared::minwindef::DWORD);
    let str_ahk_dll = CString::new("ahkdll").expect("CString::new failed");
    let str_ahk_ready = CString::new("ahkReady").expect("CString::new failed");
    let str_ahk_exec = CString::new("ahkExec").expect("CString::new failed");

    let ahkdll_ptr = GetProcAddress(handle, str_ahk_dll.as_ptr());
    let ahkready_ptr = GetProcAddress(handle, str_ahk_ready.as_ptr());
    let ahkexec_ptr = GetProcAddress(handle, str_ahk_exec.as_ptr());

    println!("{}", ahkdll_ptr as winapi::shared::minwindef::DWORD);
    println!("{}", ahkready_ptr as winapi::shared::minwindef::DWORD);
    println!("{}", ahkexec_ptr as winapi::shared::minwindef::DWORD);

    ahkdll = std::mem::transmute(ahkdll_ptr);
    ahkready = std::mem::transmute(ahkready_ptr);
    ahkexec = std::mem::transmute(ahkexec_ptr);

    let blank_quote_bytes = String::from("").into_bytes();
    let mut cchar : Vec<c_char> = blank_quote_bytes.iter().map(|w| *w as c_char).collect();
    let slice = cchar.as_mut_slice();
    let blank_quote: *mut c_char = slice.as_mut_ptr();

    // Free memory
    ahkdll(blank_quote, blank_quote, blank_quote);

    // debug
    let ten_millis = time::Duration::from_millis(10);
    while ahkready() == 0 {
        println!("{}", ahkready());
        thread::sleep(ten_millis);
    }

    // DO IT
    let blank_quote_bytes_code = String::from(code_to_exec).into_bytes();
    let cchar_code : Vec<c_char> = blank_quote_bytes_code.iter().map(|w| *w as c_char).collect();
    let slice_code = cchar.as_mut_slice();
    let code: *mut c_char = slice_code.as_mut_ptr();
    // let code = widestring::WideCString::from_str(code_to_exec).unwrap().as_ptr() as *mut i8;
    ahkexec(code);

}

fn ahk_exec_node(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    // First, get arg values
    let ahk_path = cx.argument::<JsString>(0)?.value();;
    let code_to_exec = cx.argument::<JsString>(1)?.value();;

    // Load library
    unsafe { ahk_exec(ahk_path, code_to_exec); }

    Ok(cx.undefined())
}

register_module!(mut cx, {
    cx.export_function("run_ahk_text", ahk_exec_node)
});
