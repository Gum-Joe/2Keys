/**
 * Entry point for C++ bindings
 * Uses N-API
 */
#include <tchar.h>
#include <node.h>

// Own files
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
void RunAHKText(const FunctionCallbackInfo<Value> &args)
{
  Isolate *isolate = args.GetIsolate();

  // Check we have enough args
  if (args.Length() < 2)
  {
    // Throw an Error that is passed back to JavaScript
    isolate->ThrowException(Exception::TypeError(
        String::NewFromUtf8(isolate, "Wrong number of arguments.  Need both text to execute and library path")));
    return;
  }

  // Check arg types
  if (!args[0]->IsString() || !args[1]->IsString())
  {
    isolate->ThrowException(Exception::TypeError(
        String::NewFromUtf8(isolate, "Wrong arguments")));
    return;
  }

  // Run
  v8::String::Utf8Value s(args[0]);
  std::string str(*s, s.length());
  std::wstring stemp = std::wstring(str.begin(), str.end());
  LPCWSTR ahk_path = stemp.c_str();

  v8::String::Utf8Value abc(args[1]);
  std::string strabc(*abc, abc.length());
  std::wstring stemp2 = std::wstring(strabc.begin(), strabc.end());
  LPCWSTR run_text = stemp2.c_str();

  //LPCWSTR ahk_path = L"D:\\Users\\Kishan\\Documents\\Projects\\2Keys\\cli\\lib\\ahkdll-v1-release-master\\x64w\\AutoHotkey.dll";
  // LPTSTR run_text = L"Msgbox IT WORKS ";
  run_ahk_text(run_text, ahk_path);
  }

  void Init(Local<Object> exports)
  {
    NODE_SET_METHOD(exports, "run_ahk_text", RunAHKText);
  }

  NODE_MODULE(NODE_GYP_MODULE_NAME, Init)
} // namespace 2Keys