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
TestFunc() {
  MsgBox "It works!"
}

RunTestForExecution1() {
  FileAppend("IT WORKED!", TWOKEYS_CWD "\RunTestForExecution1.txt")
}

RunTestForExecution2() {
  FileAppend("IT WORKED!", TWOKEYS_CWD "\RunTestForExecution2.txt")
}

RunTestForExecution3() {
  FileAppend("IT WORKED!", TWOKEYS_CWD "\RunTestForExecution3.txt")
}

RunTestForExecution4() {
  FileAppend("IT WORKED!", TWOKEYS_CWD "\RunTestForExecution4.txt")
}