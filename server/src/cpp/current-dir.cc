/**
 * Gets current dir
 */
#include <iostream>
#include <stdio.h>
#include <direct.h>
// From http://www.codebind.com/cpp-tutorial/c-get-current-directory-linuxwindows/
#define GetCurrentDir _getcwd

#include "current-dir.h"

namespace twokeys {
std::string GetCurrentWorkingDir()
{
  char buff[FILENAME_MAX];
  GetCurrentDir(buff, FILENAME_MAX);
  std::string current_working_dir(buff);
  return current_working_dir;
}
}
