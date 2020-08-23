/**
 * Gets startup folder on Windows
 */
#include <assert.h>
#include <napi.h>

// Windows
#include <atlbase.h> //for CComPtr
#include <string>
#include <shlobj.h> //for knownFolder
#include <winerror.h> //for HRESULT

#include "../common/error.h"

// NOTE: From https://stackoverflow.com/questions/15579932/c-how-do-we-make-our-application-start-on-computer-startup-and-of-course-aft

namespace twokeys {
  std::u16string GetStartupFolderPath(GenericWinError *error_handler) {
    PWSTR pszPath;
    HRESULT hr = SHGetKnownFolderPath(FOLDERID_Startup,
                                      0,    // no special options required
                                      NULL, // no access token required
                                      &pszPath);
    if (SUCCEEDED(hr)) {
      // The function succeeded, so copy the returned path to a
      // C++ string, free the memory allocated by the function,
      // and return the path string.
      std::wstring path(pszPath);
      CoTaskMemFree(static_cast<LPVOID>(pszPath));
      std::u16string u16str(path.begin(), path.end());
      return u16str;
    } else {
      // The function failed, so handle the error.
      // ...
      // You might want to throw an exception, or just return an
      // empty string here.
      throw std::runtime_error("The SHGetKnownFolderPath function failed");
    }
  }
}