/**
 * Copyright 2020 Kishan Sambhi
 *
 * This file is part of 2Keys.
 *
 * 2Keys is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * 2Keys is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with 2Keys.  If not, see <https://www.gnu.org/licenses/>.
 */
/**
 * @overview C++ script to pass text to AutoHotKey to run
 * Used to run functions for hot keys
 */
#include "define.h" // Definitons

// External stuff
#include <direct.h>
#include <iostream>
#include <windows.h>
// Own files
#include "atlstr.h"
#include "current-dir.h"
#include "run-ahk.h"

using namespace std;

namespace twokeys {
  AHKRunError new_ahk_run_err() {
    AHKRunError ahk_run_err;
    ahk_run_err.is_error = false;
    return ahk_run_err;
  }

  void handle_getting_err_message(AHKRunError *err, LPCWSTR library) {
    if (err->code == 126) {
      err->message = (std::string) "AHK DLL not found at" +
                     (std::string) CW2A(library) + (std::string) " !";
    } else {
      err->message =
        "See code for error.  Lookup error codes for LoadLibrary(). CODE:" +
        err->code;
    };
  }
  // @param: text {LPTSTR} a non-const TCHAR string that is the script to run
  // @param: library {LPCWSTR} Const string that says where AutoHtkey_H is
  // stored
  void run_ahk_text(LPCWSTR library, LPCWSTR text, AHKRunError *error_handler) {

    // Keep a copy of current dir for later
    std::string cwd = GetCurrentWorkingDir();
    // From https://autohotkey.com/board/topic/96666-tutorial-c-and-autohotkey/

    // Typedef the functions
    typedef BOOL (*pahkReady)(void);
    typedef BOOL (*pahkExec)(LPCWSTR script); // Co
    typedef UINT (*pahkdll)(LPTSTR script, LPTSTR p1, LPTSTR p2);

    // Load
    // HINSTANCE handle =
    // LoadLibrary("D:\\Users\\Kishan\\Documents\\Projects\\2Keys\\cli\\lib\\ahkdll-v1-release-master\\Win32a\\AutoHotkey.dll");
    HINSTANCE handle = LoadLibraryW(library);

    if (handle == NULL) {
      DWORD err = GetLastError();
      // cerr << "Error opening AHK library: " << err;
      error_handler->code = err;
      error_handler->is_error = true;
      handle_getting_err_message(error_handler, library);
    } else {
      // No err, safe to run
      // pointers
      pahkdll ahkdll = (pahkdll)GetProcAddress(handle, "ahkdll");
      pahkReady ahkReady = (pahkReady)GetProcAddress(handle, "ahkReady");
      pahkExec ahkExec = (pahkExec)GetProcAddress(handle, "ahkExec");

      // free memory
      ahkdll(L"", L"", L"");

      // debug
      while (!ahkReady()) Sleep(10);

      ahkExec(text);

      // Chdir
      _chdir(cwd.c_str());
    }
  }
}