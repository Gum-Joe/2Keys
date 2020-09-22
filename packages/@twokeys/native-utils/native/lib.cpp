#include ".\common\define.h"
#include ".\common\error.h"
#include <assert.h>
#include <napi.h>

#include <iostream>
#include "./common/error.h"
#include "getStartupFolder.h"


namespace twokeys {
  Napi::Value get_startup_folder_node(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();

    GenericWinError error_handler = new_generic_win_error();

    std::u16string start_folder = GetStartupFolderPath(&error_handler);

    // Error check
    if (error_handler.is_error) {
      Napi::Error::New(env, error_handler.message).ThrowAsJavaScriptException();
    }

    return Napi::String::New(env, start_folder);
  }

  Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set(Napi::String::New(env, "get_startup_folder"),
                Napi::Function::New(env, get_startup_folder_node));
    return exports;
  }

  NODE_API_MODULE(addon, Init)
}