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