/**
 * Header file for ahk runner
 */
#include <windows.h>
#include <node.h>

namespace twokeys {
LPCWSTR convert_to_LPCWSTR(v8::Local<v8::Value> argument);
}
