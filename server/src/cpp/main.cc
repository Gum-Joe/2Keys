/**
 * Entry point for C++ bindings
 * Uses N-API
 */
#include "define.h" // Definitons

// External stuff
#include <iostream>
#include <node.h>
#include <tchar.h>

// Own files
#include "convert.h"
#include "run-ahk.h"

namespace twokeys {
  using v8::Exception;
  using v8::FunctionCallbackInfo;
  using v8::Isolate;
  using v8::Local;
  using v8::Number;
  using v8::Object;
  using v8::String;
  using v8::Value;
  using namespace std;

  void RunAHKText(const FunctionCallbackInfo<Value> &args) {
    Isolate *isolate = args.GetIsolate();

    // Check we have enough args
    if (args.Length() < 2) {
      // Throw an Error that is passed back to JavaScript
      isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(
        isolate,
        "Wrong number of arguments.  Need both text to execute and library path")));
      return;
    }

    // Check arg types
    if (!args[0]->IsString() || !args[1]->IsString()) {
      isolate->ThrowException(
        Exception::TypeError(String::NewFromUtf8(isolate, "Wrong arguments")));
      return;
    }

    // Variables
    // Ideally, we'd use one convert function but that creates issues
    // And pointers/references

    v8::String::Utf8Value ahk_v8String(args[0]);
    std::string ahk_str(*ahk_v8String, ahk_v8String.length());
    std::wstring ahk_wstr = std::wstring(ahk_str.begin(), ahk_str.end());
    LPCWSTR ahk_path = ahk_wstr.c_str();

    v8::String::Utf8Value run_text_v8String(args[1]);
    std::string run_text_str(*run_text_v8String, run_text_v8String.length());
    std::wstring run_text_wstr =
      std::wstring(run_text_str.begin(), run_text_str.end());
    LPCWSTR run_text = run_text_wstr.c_str();

    // LPCWSTR ahk_path =
    // L"D:\\Users\\Kishan\\Documents\\Projects\\2Keys\\cli\\lib\\ahkdll-v1-release-master\\x64w\\AutoHotkey.dll";
    // LPTSTR run_text = L"Msgbox IT WORKS ";
    // Run
    AHKRunError error_handler = new_ahk_run_err();
    run_ahk_text(ahk_path, run_text, &error_handler);
    // Error check
    if (error_handler.is_error) {
      Local<Object> err_obj = Object::New(isolate);
      err_obj->Set(String::NewFromUtf8(isolate, "code"), v8::Number::New(isolate, error_handler.code));
      err_obj->Set(String::NewFromUtf8(isolate, "message"), v8::String::NewFromUtf8(isolate, error_handler.message.c_str()));
      err_obj->Set(String::NewFromUtf8(isolate, "type"), v8::String::NewFromUtf8(isolate, "AHKRunError"));
      args.GetReturnValue().Set(err_obj);
    }
  }

  void Init(Local<Object> exports) {
    NODE_SET_METHOD(exports, "run_ahk_text", RunAHKText);
  }

  NODE_MODULE(NODE_GYP_MODULE_NAME, Init)
} // namespace 2Keys