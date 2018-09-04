; Map all keys to switch to Keyboard control window
; Can be turned off with <KEY>
;
; If not working, run:
; 2Keys init --generate local.ahk.mapAll 
; Works by, on press, switches to detector and passes key through
; DO NOT MODIFY

; AHK boilerplate stuff
#NoEnv  ; Recommended for performance and compatibility with future AutoHotkey releases
#Warn  ; Enable warnings to assist with detecting common errors
#SingleInstance, force
SendMode Input  ; Recommended for new scripts due to its superior speed and reliability.
SetWorkingDir %A_ScriptDir%  ; Ensures a consistent starting directory.

; Vars
Previous = ""
OnOrOff = "0" ; 0 for OFF, 1 for ON

; Key mappings
^Q::
  WinGetClass, Previous, A
  WinActivate ahk_exe Keyboard.exe
  Send {LCtrl}Q
  Sleep 100
  winactivate ahk_class %Previous%
Return