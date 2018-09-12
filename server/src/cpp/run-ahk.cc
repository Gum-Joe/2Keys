/**
 * @overview C++ script to pass text to AutoHotKey to run
 * Used to run functions for hot keys
 */
#include "define.h" // Definitons

// External stuff
#include <iostream>
#include <windows.h>

// Own files
#include "run-ahk.h"

using namespace std;

// @param: text {LPTSTR} a non-const TCHAR string that is the script to run
// @param: library {LPCWSTR} Const string that says where AutoHtkey_H is stored
namespace twokeys {
void run_ahk_text(LPCWSTR library, LPCWSTR text)
{

  // From https://autohotkey.com/board/topic/96666-tutorial-c-and-autohotkey/

  //Typedef the functions
  typedef BOOL (*pahkReady)(void);
  typedef BOOL (*pahkExec)(LPCWSTR script); // Co
  typedef UINT (*pahkdll)(LPTSTR script, LPTSTR p1, LPTSTR p2);

  // Load
  // HINSTANCE handle = LoadLibrary("D:\\Users\\Kishan\\Documents\\Projects\\2Keys\\cli\\lib\\ahkdll-v1-release-master\\Win32a\\AutoHotkey.dll");
  HINSTANCE handle = LoadLibraryW(library);

  if (handle == NULL)
  {
    DWORD err = GetLastError();
    cerr << "Error opening AHK library: " << err;
  }
  else
  {
    // No err, safe to run
    // pointers
    pahkdll ahkdll = (pahkdll)GetProcAddress(handle, "ahkdll");
    pahkReady ahkReady = (pahkReady)GetProcAddress(handle, "ahkReady");
    pahkExec ahkExec = (pahkExec)GetProcAddress(handle, "ahkExec");

    //free memory
    ahkdll(L"", L"", L"");

    // debug
    while (!ahkReady())
      Sleep(10);

    ahkExec(text);
  }
}
}