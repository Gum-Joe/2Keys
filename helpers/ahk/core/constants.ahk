; Contains constants for AHK
#Include ./home.ahk

Global USERSPACE_ROOT := GetHomeDir() "/.2Keys"
Global USERSPACE_INI := USERSPACE_ROOT "/ini" ; For ini config files
Global USERSPACE_INI_CALLBACKS := USERSPACE_INI "/callbacks.ini" ; INI file for callbacks