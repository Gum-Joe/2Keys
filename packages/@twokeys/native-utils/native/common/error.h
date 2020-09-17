#pragma once
#include <windows.h>
#include <iostream>

namespace twokeys {
  struct GenericWinError {
    DWORD code;          // Code from windows, function GetLastError()
    std::string message; // Message from 2Keys
    bool is_error;       // Is there or is there not an error?
  };
  GenericWinError new_generic_win_error();
}