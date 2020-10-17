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
 * Gets current dir
 */
#include <iostream>
#include <stdio.h>
#include <direct.h>
// From
// http://www.codebind.com/cpp-tutorial/c-get-current-directory-linuxwindows/
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
