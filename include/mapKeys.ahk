; Map ALL Keys to incepcept
; Works by, on press, switches to detector and passes key through
; Syntax
#NoEnv  ; Recommended for performance and compatibility with future AutoHotkey releases
#Warn  ; Enable warnings to assist with detecting common errors
#SingleInstance, force
SendMode Input  ; Recommended for new scripts due to its superior speed and reliability.
SetWorkingDir %A_ScriptDir%  ; Ensures a consistent starting directory.

Previous = ""
^Q::
  WinGetClass, Previous, A
  winactivate ahk_exe Keyboard.exe
  Send {LCtrl}Q
  Sleep 100
  winactivate ahk_class %Previous%
Return