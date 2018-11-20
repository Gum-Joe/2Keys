"""
Copyright 2018 Kishan Sambhi

This file is part of 2Keys.

2Keys is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

2Keys is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with 2Keys.  If not, see <https://www.gnu.org/licenses/>.
"""

"""
Keyboard mappings
Copy paste from https://github.com/torvalds/linux/blob/master/include/uapi/linux/input-event-codes.h:
/*
 * Keys and buttons
 *
 * Most of the keys/buttons are modeled after USB HUT 1.12
 * (see http://www.usb.org/developers/hidpage).
 * Abbreviations in the comments:
 * AC - Application Control
 * AL - Application Launch Button
 * SC - System Control
 */

As such some c code is leftover (mostly '#define's.)
None = invalid key
An array of key mapping means multiple keys can correspond to it
Currently 249 keys are mapped
"""
from .constants import MAX_KEY_MAPS
# Applies custom tag to key names
def custom_name(name):
    return "$" + name + "$"

#define KEY_(.*?) (0?[xX]?[0-9a-fA-F]+)(.*) # RegExp to convert everything in VSCode
#keys[$2] = "$1" # Replacement RegExp to convert everything in VSCode
keys = [""] * MAX_KEY_MAPS # Index corresponds to code
keys[0] = None # RESERVED
keys[1] = custom_name("ESC")
keys[2] = "1"
keys[3] = "2"
keys[4] = "3"
keys[5] = "4"
keys[6] = "5"
keys[7] = "6"
keys[8] = "7"
keys[9] = "8"
keys[10] = "9"
keys[11] = "0"
keys[12] = "-" # MINUS
keys[13] = "=" # EQUAL
keys[14] = custom_name("BACKSPACE") # BACKSPACE
keys[15] = custom_name("TAB")
keys[16] = "Q"
keys[17] = "W"
keys[18] = "E"
keys[19] = "R"
keys[20] = "T"
keys[21] = "Y"
keys[22] = "U"
keys[23] = "I"
keys[24] = "O"
keys[25] = "P"
keys[26] = ["[", "{"] # LEFTBRACE
keys[27] = ["]", "}"] # RIGHTBRACE
keys[28] = custom_name("ENTER") # ENTER
keys[29] = ["<^", "^"] # LEFTCTRL
keys[30] = "A"
keys[31] = "S"
keys[32] = "D"
keys[33] = "F"
keys[34] = "G"
keys[35] = "H"
keys[36] = "J"
keys[37] = "K"
keys[38] = "L"
keys[39] = ";" # SEMICOLON
keys[40] = "\'" # APOSTROPHE
keys[41] = "`" # GRAVE
keys[42] = ["<+", "+"] # LEFTSHIFT
keys[43] = "\\" # BACKSLASH
keys[44] = "Z"
keys[45] = "X"
keys[46] = "C"
keys[47] = "V"
keys[48] = "B"
keys[49] = "N"
keys[50] = "M"
keys[51] = "," # COMMA
keys[52] = "." # DOT
keys[53] = "/" # SLASH
keys[54] = ["+>", "+"] # RIGHTSHIFT
keys[55] = custom_name("NUM_*") # KEYPAD Asterisk
keys[56] = ["<!", "!"] # LEFTALT
keys[57] = custom_name("SPACE")
keys[58] = custom_name("CAPS") # CAPSLOCK
keys[59] = "F1"
keys[60] = "F2"
keys[61] = "F3"
keys[62] = "F4"
keys[63] = "F5"
keys[64] = "F6"
keys[65] = "F7"
keys[66] = "F8"
keys[67] = "F9"
keys[68] = "F10"
keys[69] = custom_name("NUMLOCK") # NUMLOCK
keys[70] = custom_name("SCROLLLOCK")
# For these, NUM was KP
keys[71] = "NUM7"
keys[72] = "NUM8"
keys[73] = "NUM9"
keys[74] = custom_name("NUM_-")
keys[75] = "NUM4"
keys[76] = "NUM5"
keys[77] = "NUM6"
keys[78] = custom_name("NUM_+")
keys[79] = "NUM1"
keys[80] = "NUM2"
keys[81] = "NUM3"
keys[82] = "NUM0"
keys[83] = custom_name("NUM_.")

# Not included because internationlisation is a pain & I have no idea what char to reference as
# Could be reenabled by surround ZENKAKUHANKAKU with $s and using as: (example config)
# hotkeys:
#   $ZENKAKUHANKAKU$: SomeFunction
# Referenced as IC (Internationlisation confusion)
# keys[85] = "ZENKAKUHANKAKU"
keys[86] = custom_name("#") # 102ND key added to UK keyboard
keys[87] = "F11"
keys[88] = "F12"
# keys[89] = "RO" # No idea what this is, IC?
# keys[90] = "KATAKANA" # IC
# keys[91] = "HIRAGANA" # IC
# keys[92] = "HENKAN" # IC
# keys[93] = "KATAKANAHIRAGANA" # IC
# keys[94] = "MUHENKAN" # IC
# keys[95] = "KPJPCOMMA" # No idea what key this is
keys[96] = custom_name("NUM_ENTER") # KPENTER; _ used for readability
keys[97] = ["^>", "^"] # RIGHTCTRL; _ used for readability
keys[98] = custom_name("NUM_/") # KPSLASH
keys[99] = custom_name("PRINT_SCR") # Print Screen & SYSREQ. SYSREQ is used for recovery.  Thus, should throw an error if the user tries to use so the system can be recovered
keys[100] = ["!>", "!"]
keys[101] = custom_name("LINE_FEED") # New line char, backwards-compatibility; _ used for readability
keys[102] = custom_name("HOME")
keys[103] = custom_name("UP")
keys[104] = custom_name("PAGE_UP") # _ used for readability
keys[105] = custom_name("LEFT")
keys[106] = custom_name("RIGHT")
keys[107] = custom_name("END")
keys[108] = custom_name("DOWN")
keys[109] = custom_name("PAGE_DOWN") # _ used for readability
keys[110] = custom_name("INSERT")
keys[111] = custom_name("DELETE")
keys[112] = custom_name("MACRO") # Macro key from old keyboards. NOT new macro keys from i.e. Corsair keyboard.  Backwards-compatibility
keys[113] = custom_name("MUTE") # KEY_MIN_INTERESTING (see bottom)
keys[114] = custom_name("VOL_DOWN") # VOLUMEUP. _ used for readability
keys[115] = custom_name("VOL_UP") # VOLUMEUP
keys[116] = None # POWER; Throw error so the user can power the system down
keys[117] = custom_name("NUM_=") # Numpad equals
keys[118] = custom_name("NUM_+-") # KPPLUSMINUS
keys[119] = custom_name("PAUSE")
keys[120] = custom_name("SCALE")

keys[121] = custom_name("NUM_,") # KP Comma
# keys[122] = "HANGEUL" # IC
#define KEY_HANGUEL KEY_HANGEUL # Leftover from Linux
keys[123] = "HANJA" # IC
keys[124] = "YEN" # IC
keys[125] = [custom_name("LEFTMETA"), "#", "<#"] # IC, Windows key
keys[126] = [custom_name("RIGHTMETA"), "#", "#>"] # IC, Windows key
keys[127] = [custom_name("COMPOSE"), custom_name("CONTEXT_MENU")] # Compose two chars, useful as a mode key.  Also the context menu key

keys[128] = custom_name("STOP") # Stop key, don't know what for.  NOT MEDIA CONTROL
keys[129] = custom_name("AGAIN")
keys[130] = custom_name("PROPS")
keys[131] = custom_name("UNDO")
keys[132] = custom_name("FRONT")
keys[133] = custom_name("COPY")
keys[134] = custom_name("OPEN")
keys[135] = custom_name("PASTE")
keys[136] = custom_name("FIND")
keys[137] = custom_name("CUT")
keys[138] = custom_name("HELP")
keys[139] = custom_name("MENU")
keys[140] = custom_name("CALC")
keys[141] = custom_name("SETUP")
keys[142] = custom_name("SLEEP")
keys[143] = custom_name("WAKEUP")
keys[144] = custom_name("FILE")
keys[145] = custom_name("SENDFILE")
keys[146] = custom_name("DELETEFILE")
keys[147] = custom_name("XFER")
keys[148] = custom_name("PROG1")
keys[149] = custom_name("PROG2")
keys[150] = custom_name("WWW")
keys[151] = custom_name("MSDOS")
keys[152] = [custom_name("COFFEE"), custom_name("SCREEN_LOCK")]
#define KEY_SCREENLOCK KEY_COFFEE
keys[153] = custom_name("ROTATE_DISPLAY")
#define KEY_DIRECTION KEY_ROTATE_DISPLAY
keys[154] = custom_name("CYCLE_WINDOWS")
keys[155] = custom_name("MAIL")
keys[156] = custom_name("BOOKMARKS")
keys[157] = custom_name("COMPUTER")
keys[158] = custom_name("BACK")
keys[159] = custom_name("FORWARD")
keys[160] = custom_name("CLOSE_CD")
keys[161] = custom_name("EJECT_CD")
keys[162] = custom_name("EJECT_CLOSE_CD")
keys[163] = custom_name("MEDIA_NEXT") # CD
keys[164] = custom_name("MEDIA_PLAY_PAUSE") # CD
keys[165] = custom_name("MEDIA_PREVIOUS") # CD
keys[166] = custom_name("MEDIA_STOP") # CD
keys[167] = custom_name("MEDIA_RECORD") # RECORD
keys[168] = custom_name("MEDIA_REWIND") # REWIND
keys[169] = custom_name("PHONE") # Media Select Telephone
keys[170] = custom_name("ISO")
keys[171] = custom_name("CONFIG")
keys[172] = custom_name("APP_HOMEPAGE") # AC
keys[173] = custom_name("APP_REFRESH") # AC
keys[174] = custom_name("APP_EXIT") # AC
keys[175] = custom_name("MOVE")
keys[176] = custom_name("EDIT")
keys[177] = custom_name("SCROLL_UP")
keys[178] = custom_name("SCROLL_DOWN")
# keys[179] = custom_name("KPLEFTPAREN") # What is this?
# keys[180] = custom_name("KPRIGHTPAREN") # What is this?
keys[181] = custom_name("APP_NEW") # AC
keys[182] = custom_name("APP_REDO") # AC

keys[183] = "F13"
keys[184] = "F14"
keys[185] = "F15"
keys[186] = "F16"
keys[187] = "F17"
keys[188] = "F18"
keys[189] = "F19"
keys[190] = "F20"
keys[191] = "F21"
keys[192] = "F22"
keys[193] = "F23"
keys[194] = "F24"

keys[200] = custom_name("MEDIA_PLAY") # Different to MEDIA_PLAY_PAUSE, this button can only play not pause. (CDs)
keys[201] = custom_name("MEDIA_PAUSE")
# keys[202] = custom_name("PROG3") # Programmable buttons?
# keys[203] = custom_name("PROG4") # Programmable buttons?
keys[204] = custom_name("DASHBOARD")
keys[205] = custom_name("SUSPEND")
keys[206] = custom_name("CLOSE")
keys[207] = custom_name("PLAY") # How is this different to keys[200]
keys[208] = custom_name("MEDIA_FASTFORWARD")
keys[209] = custom_name("SOUND_BASSBOOST")
keys[210] = custom_name("PRINT")
keys[211] = custom_name("HP")
keys[212] = custom_name("CAMERA")
keys[213] = custom_name("SOUND")
keys[214] = custom_name("QUESTION")
keys[215] = custom_name("EMAIL")
keys[216] = custom_name("CHAT")
keys[217] = custom_name("SEARCH")
keys[218] = custom_name("CONNECT")
keys[219] = custom_name("FINANCE") # Launch Finance app
keys[220] = custom_name("SPORT")
keys[221] = custom_name("SHOP")
keys[222] = custom_name("ALTERASE")
keys[223] = custom_name("CANCEL")
keys[224] = custom_name("BRIGHTNESS_DOWN")
keys[225] = custom_name("BRIGHTNESS_UP")
keys[226] = custom_name("MEDIA")

keys[227] = custom_name("SWITCHVIDEOMODE") # "Cycle between available video outputs"
# keys[228] = custom_name("KBDILLUMTOGGLE") # What are these?
# keys[229] = custom_name("KBDILLUMDOWN") # What are these?
# keys[230] = custom_name("KBDILLUMUP") # What are these?

keys[231] = custom_name("APP_SEND") # AC
keys[232] = custom_name("APP_REPLY") # AC
keys[233] = custom_name("APP_FORWARDMAIL") # AC
keys[234] = custom_name("APP_SAVE") # AC
keys[235] = custom_name("DOCUMENTS")

keys[236] = custom_name("BATTERY")

keys[237] = custom_name("SET_BLUETOOTH") # Bluetooth on/off
keys[238] = custom_name("SET_WLAN") # Wifi on/off
keys[239] = custom_name("SET_UWB") # UWB is a radio type (like 2G, 3G, wifi)

keys[240] = custom_name("UNKNOWN") # As it says, unknown

keys[241] = custom_name("VIDEO_SOURCE_NEXT") # next video source
keys[242] = custom_name("VIDEO_SOURCE_PREV") # previous video source
keys[243] = custom_name("BRIGHTNESS_CYCLE") # "brightness up, after max is min"
keys[244] = custom_name("BRIGHTNESS_AUTO") # Auto brightness, "rely on ambient"
#define KEY_BRIGHTNESS_ZERO KEY_BRIGHTNESS_AUTO
keys[245] = custom_name("DISPLAY_OFF")

keys[246] = custom_name("SET_WWAN") # "Wireless WAN (LTE, UMTS, GSM, etc.)". KEY_WWAN
#define KEY_WIMAX KEY_WWAN # ALias for above
keys[247] = custom_name("RFKILL") # "Key that controls all radios"

keys[248] = custom_name("MICMUTE") # Microphone mute

# "Code 255 is reserved for special needs of AT keyboard driver"

# I think this is mouse stuff, so it remains commented out
#define BTN_MISC 0x100
#define BTN_0 0x100
#define BTN_1 0x101
#define BTN_2 0x102
#define BTN_3 0x103
#define BTN_4 0x104
#define BTN_5 0x105
#define BTN_6 0x106
#define BTN_7 0x107
#define BTN_8 0x108
#define BTN_9 0x109

#define BTN_MOUSE 0x110
#define BTN_LEFT 0x110
#define BTN_RIGHT 0x111
#define BTN_MIDDLE 0x112
#define BTN_SIDE 0x113
#define BTN_EXTRA 0x114
#define BTN_FORWARD 0x115
#define BTN_BACK 0x116
#define BTN_TASK 0x117

#define BTN_JOYSTICK 0x120
#define BTN_TRIGGER 0x120
#define BTN_THUMB 0x121
#define BTN_THUMB2 0x122
#define BTN_TOP 0x123
#define BTN_TOP2 0x124
#define BTN_PINKIE 0x125
#define BTN_BASE 0x126
#define BTN_BASE2 0x127
#define BTN_BASE3 0x128
#define BTN_BASE4 0x129
#define BTN_BASE5 0x12a
#define BTN_BASE6 0x12b
#define BTN_DEAD 0x12f

#define BTN_GAMEPAD 0x130
#define BTN_SOUTH 0x130
#define BTN_A BTN_SOUTH
#define BTN_EAST 0x131
#define BTN_B BTN_EAST
#define BTN_C 0x132
#define BTN_NORTH 0x133
#define BTN_X BTN_NORTH
#define BTN_WEST 0x134
#define BTN_Y BTN_WEST
#define BTN_Z 0x135
#define BTN_TL 0x136
#define BTN_TR 0x137
#define BTN_TL2 0x138
#define BTN_TR2 0x139
#define BTN_SELECT 0x13a
#define BTN_START 0x13b
#define BTN_MODE 0x13c
#define BTN_THUMBL 0x13d
#define BTN_THUMBR 0x13e

#define BTN_DIGI 0x140
#define BTN_TOOL_PEN 0x140
#define BTN_TOOL_RUBBER 0x141
#define BTN_TOOL_BRUSH 0x142
#define BTN_TOOL_PENCIL 0x143
#define BTN_TOOL_AIRBRUSH 0x144
#define BTN_TOOL_FINGER 0x145
#define BTN_TOOL_MOUSE 0x146
#define BTN_TOOL_LENS 0x147
#define BTN_TOOL_QUINTTAP 0x148 /* Five fingers on trackpad */
#define BTN_STYLUS3 0x149
#define BTN_TOUCH 0x14a
#define BTN_STYLUS 0x14b
#define BTN_STYLUS2 0x14c
#define BTN_TOOL_DOUBLETAP 0x14d
#define BTN_TOOL_TRIPLETAP 0x14e
#define BTN_TOOL_QUADTAP 0x14f /* Four fingers on trackpad */

#define BTN_WHEEL 0x150
#define BTN_GEAR_DOWN 0x150
#define BTN_GEAR_UP 0x151

# NOTE: 0x160 != decimal 160
# Below here is the rest
# These are untouched since I have no idea if people would want to use them
# plus it would take too long to adjust them all
# Thus, they are disabled
# keys[0x160] = "OK"
# keys[0x161] = "SELECT"
# keys[0x162] = "GOTO"
# keys[0x163] = "CLEAR"
# keys[0x164] = "POWER2"
# keys[0x165] = "OPTION"
# keys[0x166] = "INFO"
# keys[0x167] = "TIME"
# keys[0x168] = "VENDOR"
# keys[0x169] = "ARCHIVE"
# keys[0x16a] = "PROGRAM"
# keys[0x16b] = "CHANNEL"
# keys[0x16c] = "FAVORITES"
# keys[0x16d] = "EPG"
# keys[0x16e] = "PVR"
# keys[0x16f] = "MHP"
# keys[0x170] = "LANGUAGE"
# keys[0x171] = "TITLE"
# keys[0x172] = "SUBTITLE"
# keys[0x173] = "ANGLE"
# keys[0x174] = "ZOOM"
# keys[0x175] = "MODE"
# keys[0x176] = "KEYBOARD"
# keys[0x177] = "SCREEN"
# keys[0x178] = "PC"
# keys[0x179] = "TV"
# keys[0x17a] = "TV2"
# keys[0x17b] = "VCR"
# keys[0x17c] = "VCR2"
# keys[0x17d] = "SAT"
# keys[0x17e] = "SAT2"
# keys[0x17f] = "CD"
# keys[0x180] = "TAPE"
# keys[0x181] = "RADIO"
# keys[0x182] = "TUNER"
# keys[0x183] = "PLAYER"
# keys[0x184] = "TEXT"
# keys[0x185] = "DVD"
# keys[0x186] = "AUX"
# keys[0x187] = "MP3"
# keys[0x188] = "AUDIO"
# keys[0x189] = "VIDEO"
# keys[0x18a] = "DIRECTORY"
# keys[0x18b] = "LIST"
# keys[0x18c] = "MEMO"
# keys[0x18d] = "CALENDAR"
# keys[0x18e] = "RED"
# keys[0x18f] = "GREEN"
# keys[0x190] = "YELLOW"
# keys[0x191] = "BLUE"
# keys[0x192] = "CHANNELUP"
# keys[0x193] = "CHANNELDOWN"
# keys[0x194] = "FIRST"
# keys[0x195] = "LAST"
# keys[0x196] = "AB"
# keys[0x197] = "NEXT"
# keys[0x198] = "RESTART"
# keys[0x199] = "SLOW"
# keys[0x19a] = "SHUFFLE"
# keys[0x19b] = "BREAK"
# keys[0x19c] = "PREVIOUS"
# keys[0x19d] = "DIGITS"
# keys[0x19e] = "TEEN"
# keys[0x19f] = "TWEN"
# keys[0x1a0] = "VIDEOPHONE"
# keys[0x1a1] = "GAMES"
# keys[0x1a2] = "ZOOMIN"
# keys[0x1a3] = "ZOOMOUT"
# keys[0x1a4] = "ZOOMRESET"
# keys[0x1a5] = "WORDPROCESSOR"
# keys[0x1a6] = "EDITOR"
# keys[0x1a7] = "SPREADSHEET"
# keys[0x1a8] = "GRAPHICSEDITOR"
# keys[0x1a9] = "PRESENTATION"
# keys[0x1aa] = "DATABASE"
# keys[0x1ab] = "NEWS"
# keys[0x1ac] = "VOICEMAIL"
# keys[0x1ad] = "ADDRESSBOOK"
# keys[0x1ae] = "MESSENGER"
# keys[0x1af] = "DISPLAYTOGGLE"
#define KEY_BRIGHTNESS_TOGGLE KEY_DISPLAYTOGGLE
# keys[0x1b0] = "SPELLCHECK"
# keys[0x1b1] = "LOGOFF"

# keys[0x1b2] = "DOLLAR"
# keys[0x1b3] = "EURO"

# keys[0x1b4] = "FRAMEBACK"
# keys[0x1b5] = "FRAMEFORWARD"
# keys[0x1b6] = "CONTEXT_MENU"
# keys[0x1b7] = "MEDIA_REPEAT"
# keys[0x1b8] = "10CHANNELSUP"
# keys[0x1b9] = "10CHANNELSDOWN"
# keys[0x1ba] = "IMAGES"

# keys[0x1c0] = "DEL_EOL"
# keys[0x1c1] = "DEL_EOS"
# keys[0x1c2] = "INS_LINE"
# keys[0x1c3] = "DEL_LINE"

# keys[0x1d0] = "FN"
# keys[0x1d1] = "FN_ESC"
# keys[0x1d2] = "FN_F1"
# keys[0x1d3] = "FN_F2"
# keys[0x1d4] = "FN_F3"
# keys[0x1d5] = "FN_F4"
# keys[0x1d6] = "FN_F5"
# keys[0x1d7] = "FN_F6"
# keys[0x1d8] = "FN_F7"
# keys[0x1d9] = "FN_F8"
# keys[0x1da] = "FN_F9"
# keys[0x1db] = "FN_F10"
# keys[0x1dc] = "FN_F11"
# keys[0x1dd] = "FN_F12"
# keys[0x1de] = "FN_1"
# keys[0x1df] = "FN_2"
# keys[0x1e0] = "FN_D"
# keys[0x1e1] = "FN_E"
# keys[0x1e2] = "FN_F"
# keys[0x1e3] = "FN_S"
# keys[0x1e4] = "FN_B"

# keys[0x1f1] = "BRL_DOT1"
# keys[0x1f2] = "BRL_DOT2"
# keys[0x1f3] = "BRL_DOT3"
# keys[0x1f4] = "BRL_DOT4"
# keys[0x1f5] = "BRL_DOT5"
# keys[0x1f6] = "BRL_DOT6"
# keys[0x1f7] = "BRL_DOT7"
# keys[0x1f8] = "BRL_DOT8"
# keys[0x1f9] = "BRL_DOT9"
# keys[0x1fa] = "BRL_DOT10"

# keys[0x200] = "NUMERIC_0"
# keys[0x201] = "NUMERIC_1"
# keys[0x202] = "NUMERIC_2"
# keys[0x203] = "NUMERIC_3"
# keys[0x204] = "NUMERIC_4"
# keys[0x205] = "NUMERIC_5"
# keys[0x206] = "NUMERIC_6"
# keys[0x207] = "NUMERIC_7"
# keys[0x208] = "NUMERIC_8"
# keys[0x209] = "NUMERIC_9"
# keys[0x20a] = "NUMERIC_STAR"
# keys[0x20b] = "NUMERIC_POUND"
# keys[0x20c] = "NUMERIC_A"
# keys[0x20d] = "NUMERIC_B"
# keys[0x20e] = "NUMERIC_C"
# keys[0x20f] = "NUMERIC_D"

# keys[0x210] = "CAMERA_FOCUS"
# keys[0x211] = "WPS_BUTTON"

# keys[0x212] = "TOUCHPAD_TOGGLE"
# keys[0x213] = "TOUCHPAD_ON"
# keys[0x214] = "TOUCHPAD_OFF"

# keys[0x215] = "CAMERA_ZOOMIN"
# keys[0x216] = "CAMERA_ZOOMOUT"
# keys[0x217] = "CAMERA_UP"
# keys[0x218] = "CAMERA_DOWN"
# keys[0x219] = "CAMERA_LEFT"
# keys[0x21a] = "CAMERA_RIGHT"

# keys[0x21b] = "ATTENDANT_ON"
# keys[0x21c] = "ATTENDANT_OFF"
# keys[0x21d] = "ATTENDANT_TOGGLE"
# keys[0x21e] = "LIGHTS_TOGGLE"

#define BTN_DPAD_UP 0x220
#define BTN_DPAD_DOWN 0x221
#define BTN_DPAD_LEFT 0x222
#define BTN_DPAD_RIGHT 0x223

# keys[0x230] = "ALS_TOGGLE"
# keys[0x231] = "ROTATE_LOCK_TOGGLE"

# keys[0x240] = "BUTTONCONFIG"
# keys[0x241] = "TASKMANAGER"
# keys[0x242] = "JOURNAL"
# keys[0x243] = "CONTROLPANEL"
# keys[0x244] = "APPSELECT"
# keys[0x245] = "SCREENSAVER"
# keys[0x246] = "VOICECOMMAND"
# keys[0x247] = "ASSISTANT"

# keys[0x250] = "BRIGHTNESS_MIN"
# keys[0x251] = "BRIGHTNESS_MAX"

# keys[0x260] = "KBDINPUTASSIST_PREV"
# keys[0x261] = "KBDINPUTASSIST_NEXT"
# keys[0x262] = "KBDINPUTASSIST_PREVGROUP"
# keys[0x263] = "KBDINPUTASSIST_NEXTGROUP"
# keys[0x264] = "KBDINPUTASSIST_ACCEPT"
# keys[0x265] = "KBDINPUTASSIST_CANCEL"

# Diagonal movement keys
# keys[0x266] = "RIGHT_UP"
# keys[0x267] = "RIGHT_DOWN"
# keys[0x268] = "LEFT_UP"
# keys[0x269] = "LEFT_DOWN"

# keys[0x26a] = "ROOT_MENU"
# Show Top Menu of the Media (e.g. DVD) */
# keys[0x26b] = "MEDIA_TOP_MENU"
# keys[0x26c] = "NUMERIC_11"
# keys[0x26d] = "NUMERIC_12"
#
# "Toggle Audio Description: refers to an audio service that helps blind and
# visually impaired consumers understand the action in a program. Note: in
# some countries this is referred to as "Video Description"."
#
# keys[0x26e] = "AUDIO_DESC"
# keys[0x26f] = "3D_MODE"
# keys[0x270] = "NEXT_FAVORITE"
# keys[0x271] = "STOP_RECORD"
# keys[0x272] = "PAUSE_RECORD"
# keys[0x273] = "VOD"
# keys[0x274] = "UNMUTE"
# keys[0x275] = "FASTREVERSE"
# keys[0x276] = "SLOWREVERSE"
###
# "Control a data application associated with the currently viewed channel,
# e.g. teletext or data broadcast application (MHEG, MHP, HbbTV, etc.)"
###
# keys[0x277] = "DATA"
# keys[0x278] = "ONSCREEN_KEYBOARD"

# WHAT ARE THESE:
#define BTN_TRIGGER_HAPPY 0x2c0
#define BTN_TRIGGER_HAPPY1 0x2c0
#define BTN_TRIGGER_HAPPY2 0x2c1
#define BTN_TRIGGER_HAPPY3 0x2c2
#define BTN_TRIGGER_HAPPY4 0x2c3
#define BTN_TRIGGER_HAPPY5 0x2c4
#define BTN_TRIGGER_HAPPY6 0x2c5
#define BTN_TRIGGER_HAPPY7 0x2c6
#define BTN_TRIGGER_HAPPY8 0x2c7
#define BTN_TRIGGER_HAPPY9 0x2c8
#define BTN_TRIGGER_HAPPY10 0x2c9
#define BTN_TRIGGER_HAPPY11 0x2ca
#define BTN_TRIGGER_HAPPY12 0x2cb
#define BTN_TRIGGER_HAPPY13 0x2cc
#define BTN_TRIGGER_HAPPY14 0x2cd
#define BTN_TRIGGER_HAPPY15 0x2ce
#define BTN_TRIGGER_HAPPY16 0x2cf
#define BTN_TRIGGER_HAPPY17 0x2d0
#define BTN_TRIGGER_HAPPY18 0x2d1
#define BTN_TRIGGER_HAPPY19 0x2d2
#define BTN_TRIGGER_HAPPY20 0x2d3
#define BTN_TRIGGER_HAPPY21 0x2d4
#define BTN_TRIGGER_HAPPY22 0x2d5
#define BTN_TRIGGER_HAPPY23 0x2d6
#define BTN_TRIGGER_HAPPY24 0x2d7
#define BTN_TRIGGER_HAPPY25 0x2d8
#define BTN_TRIGGER_HAPPY26 0x2d9
#define BTN_TRIGGER_HAPPY27 0x2da
#define BTN_TRIGGER_HAPPY28 0x2db
#define BTN_TRIGGER_HAPPY29 0x2dc
#define BTN_TRIGGER_HAPPY30 0x2dd
#define BTN_TRIGGER_HAPPY31 0x2de
#define BTN_TRIGGER_HAPPY32 0x2df
#define BTN_TRIGGER_HAPPY33 0x2e0
#define BTN_TRIGGER_HAPPY34 0x2e1
#define BTN_TRIGGER_HAPPY35 0x2e2
#define BTN_TRIGGER_HAPPY36 0x2e3
#define BTN_TRIGGER_HAPPY37 0x2e4
#define BTN_TRIGGER_HAPPY38 0x2e5
#define BTN_TRIGGER_HAPPY39 0x2e6
#define BTN_TRIGGER_HAPPY40 0x2e7

# We avoid low common keys in module aliases so they don't get huge.
#define KEY_MIN_INTERESTING KEY_MUTE  # From original c code  
# i.e. KEY_MUTE is the minimum interesting one
# Have no idea if this is correct
# NOTE: Should be 0x300
keys[MAX_KEY_MAPS - 1] = None # MAX keys is 0x2ff
#define KEY_CNT (KEY_MAX+1) # No ides what this is
