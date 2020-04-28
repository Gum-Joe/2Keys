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
; AHK V2 Script to generate Callbacks
#Include ../core/constants.ahk


; Generates a callback
GenerateCallback(id) {
  ; Step 1: Reserve in INI
  IniWrite "true", USERSPACE_INI_CALLBACKS, id, "enabled"
  IniWrite "pending", USERSPACE_INI_CALLBACKS, id, "status"
  IniWrite "err", USERSPACE_INI_CALLBACKS, id, "null"

  ; Setp 2: Return cb to resolve
  CallbackHandler(err) {
    MsgBox err
    IniWrite "resolved", USERSPACE_INI_CALLBACKS, id, "status"
  }

  return CallbackHandler
  
}