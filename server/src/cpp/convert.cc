/**
 * Conversion functions
 */
#include "define.h" // Definitons

#include <windows.h>
#include <node.h>

// Own stuff
#include "convert.h"

namespace twokeys {
  // Really should use pointers
LPCWSTR convert_to_LPCWSTR(v8::Local<v8::Value> *argument)
{
  v8::String::Utf8Value v8String(*argument);
  std::string str(*v8String, v8String.length());
  std::wstring wstr = std::wstring(str.begin(), str.end());
  LPCWSTR lpcwstr_obj = wstr.c_str();
  return lpcwstr_obj;
}
}