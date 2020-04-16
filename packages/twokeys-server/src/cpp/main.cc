/**
Copyright 2018 Kishan Sambhi

This file is part of 2Keys.

2Keys is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

2Keys is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with 2Keys.  If not, see <https://www.gnu.org/licenses/>.
*/
/**
 * Entry point for C++ bindings
 * Uses N-API
 */
#include "define.h" // Definitons
#include <assert.h>
#include <napi.h>

// External stuff
#include <iostream>
#include <tchar.h>

// Own files
#include "run-ahk.h"

namespace twokeys {
  Napi::Value AHK_NAPI(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() < 2) {
      Napi::TypeError::New(env, "Wrong number of arguments")
        .ThrowAsJavaScriptException();
      return env.Null();
    }

    if (!info[0].IsString() || !info[1].IsString()) {
      Napi::TypeError::New(env, "Wrong argument types!").ThrowAsJavaScriptException();
      return env.Null();
    }

    std::string const run_text_str = info[1].As<Napi::String>().Utf8Value();
    std::string const ahk_path_str = info[0].As<Napi::String>().Utf8Value();

    std::wstring ahk_path_wstr =
      std::wstring(ahk_path_str.begin(), ahk_path_str.end());
    LPCWSTR ahk_path = ahk_path_wstr.c_str();
    std::wstring run_text_wstr =
      std::wstring(run_text_str.begin(), run_text_str.end());
    LPCWSTR run_text = run_text_wstr.c_str();

    AHKRunError error_handler = new_ahk_run_err();
    run_ahk_text(ahk_path, run_text, &error_handler);
    // Error check
    if (error_handler.is_error) {
      Napi::Error::New(env, error_handler.message).ThrowAsJavaScriptException();
    }

    //size_t result1;
    //status = napi_get_value_string_utf8(env, argv[0], ahk_str, 100, &result1);

    //if (status != napi_ok) {
    //  napi_throw_error(env, NULL, "Invalid string was passed as argument 1");
    //}

    /**status = napi_get_value_string_utf8(env, argv[1], &run_text_str);

    if (status != napi_ok) {
      napi_throw_error(env, NULL, "Invalid string was passed as argument 2");
    }

    std::wstring ahk_wstr = std::wstring(ahk_str.begin(), ahk_str.end());
    LPCWSTR ahk_path = ahk_wstr.c_str();
    std::wstring run_text_wstr =
      std::wstring(run_text_str.begin(), run_text_str.end());
    LPCWSTR run_text = run_text_wstr.c_str();

    // RUn
    AHKRunError error_handler = new_ahk_run_err();
    run_ahk_text(ahk_path, run_text, &error_handler);
    // Error check
    if (error_handler.is_error) {
      napi_throw_error(env, NULL, "Execution error!");
    }**/
    return Napi::Number::New(env, 0);

  }

  Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set(Napi::String::New(env, "run_ahk_text"),
                Napi::Function::New(env, AHK_NAPI));
    return exports;
}

NODE_API_MODULE(addon, Init)
}