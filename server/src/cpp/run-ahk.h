/**
 * Header file for ahk runner
 */

#include <windows.h>

namespace twokeys {
  struct AHKRunError {
    DWORD code; // Code from windows, function GetLastError()
    std::string message; // Message from 2Keys
    bool is_error; // Is there or is there not an error?
  };
  void run_ahk_text(LPCWSTR library, LPCWSTR text, AHKRunError *error_handler);
  void handle_getting_err_message(AHKRunError *err);
  AHKRunError new_ahk_run_err();
}