'
' Copyright 2018 Kishan Sambhi

' This file is part of 2Keys.

' 2Keys is free software: you can redistribute it and/or modify
' it under the terms of the GNU General Public License as published by
' the Free Software Foundation, either version 3 of the License, or
' (at your option) any later version.

' 2Keys is distributed in the hope that it will be useful,
' but WITHOUT ANY WARRANTY; without even the implied warranty of
' MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
' GNU General Public License for more details.

' You should have received a copy of the GNU General Public License
' along with 2Keys.  If not, see <https://www.gnu.org/licenses/>.
'

' FILE AUTO-GENERATED BY 2KEYS
' DO NOT MODIFY
' Project name: test_project
Set oShell = CreateObject("Wscript.Shell") 
Dim strArgs
strArgs = "cmd /c node D:\Users\Kishan\Documents\Projects\CONFIDENTIAL\2Keys\2Keys-UI\twokeys\packages\@twokeys\common-hi\testing\.2Keys\daemon.js"
oShell.Run strArgs, 0, false
