/**
 * Entry point for C++ bindings
 * Uses N-API
 */
#include <tchar.h>
#include <node_api.h>

// Own files
#include "run-ahk.h"

namespace twokeys {
  napi_value Method(napi_env env, napi_callback_info args)
  {
    napi_value greeting;
    napi_status status;

    LPCWSTR ahk_path = L"D:\\Users\\Kishan\\Documents\\Projects\\2Keys\\cli\\lib\\ahkdll-v1-release-master\\x64w\\AutoHotkey.dll";
    LPTSTR run_text = L"Msgbox IT WORKS ";
    run_ahk_text(run_text, ahk_path);

    status = napi_create_string_utf8(env, "hello", NAPI_AUTO_LENGTH, &greeting);
    if (status != napi_ok)
      return nullptr;
    return greeting;
  }

  napi_value init(napi_env env, napi_value exports)
  {
    napi_status status;
    napi_value fn;

    status = napi_create_function(env, nullptr, 0, Method, nullptr, &fn);
    if (status != napi_ok)
      return nullptr;

    status = napi_set_named_property(env, exports, "hello", fn);
    if (status != napi_ok)
      return nullptr;
    return exports;
  }

  NAPI_MODULE(NODE_GYP_MODULE_NAME, init)
} // namespace 2Keys