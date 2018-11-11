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