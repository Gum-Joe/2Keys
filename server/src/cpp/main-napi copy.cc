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
  napi_value MyFunction(napi_env env, napi_callback_info info) {
    napi_status status;
    size_t argc = 2;
    napi_value argv[2];
    // TODO: Validate not larger then 1000
    char ahk_str[1000];
    std::string run_text_str;

    status = napi_get_cb_info(env, info, &argc, argv, NULL, NULL);

    if (status != napi_ok) {
      napi_throw_error(env, NULL, "Failed to parse arguments");
    }

    if (argc < 2) {
      // Throw an Error that is passed back to JavaScript
      napi_throw_error(env, NULL, "Wrong number of arguments");
      return nullptr;
    }

    napi_valuetype valuetype0;
    status = napi_typeof(env, argv[0], &valuetype0);
    assert(status == napi_ok);

    napi_valuetype valuetype1;
    status = napi_typeof(env, argv[1], &valuetype1);
    assert(status == napi_ok);

    if (valuetype0 != napi_string || valuetype1 != napi_string) {
      napi_throw_type_error(env, nullptr, "Wrong arguments");
      return nullptr;
    }

    size_t strSize;
    status = napi_get_value_string_utf8(env, argv[0], NULL, NULL, &strSize);
    assert(status == napi_ok);
    LPCWSTR value0[strSize];
    size_t copied0;
    status =
      napi_get_value_string_utf16(env, argv[0], value0, bufSize, &copied0);
    assert(status == napi_ok);
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
    napi_value myNumber;
    status = napi_create_int32(env, 1, &myNumber);

    if (status != napi_ok) {
      napi_throw_error(env, NULL, "Unable to create return value");
    }
    return myNumber;
  }

  napi_value Init(napi_env env, napi_value exports) {
    napi_status status;
    napi_value fn;

    status = napi_create_function(env, NULL, 0, MyFunction, NULL, &fn);
    if (status != napi_ok) {
      napi_throw_error(env, NULL, "Unable to wrap native function");
    }

    status = napi_set_named_property(env, exports, "run_ahk_text", fn);
    if (status != napi_ok) {
      napi_throw_error(env, NULL, "Unable to populate exports");
    }

    return exports;
  }

  NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)
}