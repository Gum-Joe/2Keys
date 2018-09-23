
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
"""
#define KEY_(.*)\t+([0-9]+)
keys = [] # Index correspondes to code
keys[0] = "RESERVED"
keys[1] = "ESC"
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
keys[12] = "MINUS"
keys[13] = "EQUAL"
keys[14] = "BACKSPACE"
keys[15] = "TAB"
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
keys[26] = "LEFTBRACE"
keys[27] = "RIGHTBRACE"
keys[28] = "ENTER"
keys[29] = "LEFTCTRL"
keys[30] = "A"
keys[31] = "S"
keys[32] = "D"
keys[33] = "F"
keys[34] = "G"
keys[35] = "H"
keys[36] = "J"
keys[37] = "K"
keys[38] = "L"
keys[39] = "SEMICOLON"
keys[40] = "APOSTROPHE"
keys[41] = "GRAVE"
keys[42] = "LEFTSHIFT"
keys[43] = "BACKSLASH"
keys[44] = "Z"
keys[45] = "X"
keys[46] = "C"
keys[47] = "V"
keys[48] = "B"
keys[49] = "N"
keys[50] = "M"
keys[51] = "COMMA"
keys[52] = "DOT"
keys[53] = "SLASH"
keys[54] = "RIGHTSHIFT"
keys[55] = "KPASTERISK"
keys[56] = "LEFTALT"
keys[57] = "SPACE"
keys[58] = "CAPSLOCK"
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
keys[69] = "NUMLOCK"
keys[70] = "SCROLLLOCK"
keys[71] = "KP7"
keys[72] = "KP8"
keys[73] = "KP9"
keys[74] = "KPMINUS"
keys[75] = "KP4"
keys[76] = "KP5"
keys[77] = "KP6"
keys[78] = "KPPLUS"
keys[79] = "KP1"
keys[80] = "KP2"
keys[81] = "KP3"
keys[82] = "KP0"
keys[83] = "KPDOT"

keys[85] = "ZENKAKUHANKAKU"
keys[86] = "102ND"
keys[87] = "F11"
keys[88] = "F12"
keys[89] = "RO"
keys[90] = "KATAKANA"
keys[91] = "HIRAGANA"
keys[92] = "HENKAN"
keys[93] = "KATAKANAHIRAGANA"
keys[94] = "MUHENKAN"
keys[95] = "KPJPCOMMA"
keys[96] = "KPENTER"
keys[97] = "RIGHTCTRL"
keys[98] = "KPSLASH"
keys[99] = "SYSRQ"
keys[100] = "RIGHTALT"
keys[101] = "LINEFEED"
keys[102] = "HOME"
keys[103] = "UP"
keys[104] = "PAGEUP"
keys[105] = "LEFT"
keys[106] = "RIGHT"
keys[107] = "END"
keys[108] = "DOWN"
keys[109] = "PAGEDOWN"
keys[110] = "INSERT"
keys[111] = "DELETE"
keys[112] = "MACRO"
keys[113] = "MUTE"
keys[114] = "VOLUMEDOWN"
keys[115] = "VOLUMEUP"
keys[116] = "POWER"
keys[117] = "KPEQUAL"
keys[118] = "KPPLUSMINUS"
keys[119] = "PAUSE"
keys[120] = "SCALE"

keys[121] = "KPCOMMA"
keys[122] = "HANGEUL"
#define KEY_HANGUEL KEY_HANGEUL
keys[123] = "HANJA"
keys[124] = "YEN"
keys[125] = "LEFTMETA"
keys[126] = "RIGHTMETA"
keys[127] = "COMPOSE"

keys[128] = "STOP"
keys[129] = "AGAIN"
keys[130] = "PROPS"
keys[131] = "UNDO"
keys[132] = "FRONT"
keys[133] = "COPY"
keys[134] = "OPEN"
keys[135] = "PASTE"
keys[136] = "FIND"
keys[137] = "CUT"
keys[138] = "HELP"
keys[139] = "MENU"
keys[140] = "CALC"
keys[141] = "SETUP"
keys[142] = "SLEEP"
keys[143] = "WAKEUP"
keys[144] = "FILE"
keys[145] = "SENDFILE"
keys[146] = "DELETEFILE"
keys[147] = "XFER"
keys[148] = "PROG1"
keys[149] = "PROG2"
keys[150] = "WWW"
keys[151] = "MSDOS"
keys[152] = "COFFEE"
#define KEY_SCREENLOCK KEY_COFFEE
keys[153] = "ROTATE_DISPLAY"
#define KEY_DIRECTION KEY_ROTATE_DISPLAY
keys[154] = "CYCLEWINDOWS"
keys[155] = "MAIL"
keys[156] = "BOOKMARKS"
keys[157] = "COMPUTER"
keys[158] = "BACK"
keys[159] = "FORWARD"
keys[160] = "CLOSECD"
keys[161] = "EJECTCD"
keys[162] = "EJECTCLOSECD"
keys[163] = "NEXTSONG"
keys[164] = "PLAYPAUSE"
keys[165] = "PREVIOUSSONG"
keys[166] = "STOPCD"
keys[167] = "RECORD"
keys[168] = "REWIND"
keys[169] = "PHONE"
keys[170] = "ISO"
keys[171] = "CONFIG"
keys[172] = "HOMEPAGE"
keys[173] = "REFRESH"
keys[174] = "EXIT"
keys[175] = "MOVE"
keys[176] = "EDIT"
keys[177] = "SCROLLUP"
keys[178] = "SCROLLDOWN"
keys[179] = "KPLEFTPAREN"
keys[180] = "KPRIGHTPAREN"
keys[181] = "NEW"
keys[182] = "REDO"

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

keys[200] = "PLAYCD"
keys[201] = "PAUSECD"
keys[202] = "PROG3"
keys[203] = "PROG4"
keys[204] = "DASHBOARD"
keys[205] = "SUSPEND"
keys[206] = "CLOSE"
keys[207] = "PLAY"
keys[208] = "FASTFORWARD"
keys[209] = "BASSBOOST"
keys[210] = "PRINT"
keys[211] = "HP"
keys[212] = "CAMERA"
keys[213] = "SOUND"
keys[214] = "QUESTION"
keys[215] = "EMAIL"
keys[216] = "CHAT"
keys[217] = "SEARCH"
keys[218] = "CONNECT"
keys[219] = "FINANCE"
keys[220] = "SPORT"
keys[221] = "SHOP"
keys[222] = "ALTERASE"
keys[223] = "CANCEL"
keys[224] = "BRIGHTNESSDOWN"
keys[225] = "BRIGHTNESSUP"
keys[226] = "MEDIA"

keys[227] = "SWITCHVIDEOMODE"
    outputs (Monitor/LCD/TV-out/etc) */
keys[228] = "KBDILLUMTOGGLE"
keys[229] = "KBDILLUMDOWN"
keys[230] = "KBDILLUMUP"

keys[231] = "SEND"
keys[232] = "REPLY"
keys[233] = "FORWARDMAIL"
keys[234] = "SAVE"
keys[235] = "DOCUMENTS"

keys[236] = "BATTERY"

keys[237] = "BLUETOOTH"
keys[238] = "WLAN"
keys[239] = "UWB"

keys[240] = "UNKNOWN"

keys[241] = "VIDEO_NEXT"
keys[242] = "VIDEO_PREV"
keys[243] = "BRIGHTNESS_CYCLE"
keys[244] = "BRIGHTNESS_AUTO"
   brightness control is off,
   rely on ambient */
#define KEY_BRIGHTNESS_ZERO KEY_BRIGHTNESS_AUTO
keys[245] = "DISPLAY_OFF"

keys[246] = "WWAN"
#define KEY_WIMAX KEY_WWAN
keys[247] = "RFKILL"

keys[248] = "MICMUTE"

/* Code 255 is reserved for special needs of AT keyboard driver */

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

keys[0x160] = "OK"
keys[0x161] = "SELECT"
keys[0x162] = "GOTO"
keys[0x163] = "CLEAR"
keys[0x164] = "POWER2"
keys[0x165] = "OPTION"
keys[0x166] = "INFO"
keys[0x167] = "TIME"
keys[0x168] = "VENDOR"
keys[0x169] = "ARCHIVE"
keys[0x16a] = "PROGRAM"
keys[0x16b] = "CHANNEL"
keys[0x16c] = "FAVORITES"
keys[0x16d] = "EPG"
keys[0x16e] = "PVR"
keys[0x16f] = "MHP"
keys[0x170] = "LANGUAGE"
keys[0x171] = "TITLE"
keys[0x172] = "SUBTITLE"
keys[0x173] = "ANGLE"
keys[0x174] = "ZOOM"
keys[0x175] = "MODE"
keys[0x176] = "KEYBOARD"
keys[0x177] = "SCREEN"
keys[0x178] = "PC"
keys[0x179] = "TV"
keys[0x17a] = "TV2"
keys[0x17b] = "VCR"
keys[0x17c] = "VCR2"
keys[0x17d] = "SAT"
keys[0x17e] = "SAT2"
keys[0x17f] = "CD"
keys[0x180] = "TAPE"
keys[0x181] = "RADIO"
keys[0x182] = "TUNER"
keys[0x183] = "PLAYER"
keys[0x184] = "TEXT"
keys[0x185] = "DVD"
keys[0x186] = "AUX"
keys[0x187] = "MP3"
keys[0x188] = "AUDIO"
keys[0x189] = "VIDEO"
keys[0x18a] = "DIRECTORY"
keys[0x18b] = "LIST"
keys[0x18c] = "MEMO"
keys[0x18d] = "CALENDAR"
keys[0x18e] = "RED"
keys[0x18f] = "GREEN"
keys[0x190] = "YELLOW"
keys[0x191] = "BLUE"
keys[0x192] = "CHANNELUP"
keys[0x193] = "CHANNELDOWN"
keys[0x194] = "FIRST"
keys[0x195] = "LAST"
keys[0x196] = "AB"
keys[0x197] = "NEXT"
keys[0x198] = "RESTART"
keys[0x199] = "SLOW"
keys[0x19a] = "SHUFFLE"
keys[0x19b] = "BREAK"
keys[0x19c] = "PREVIOUS"
keys[0x19d] = "DIGITS"
keys[0x19e] = "TEEN"
keys[0x19f] = "TWEN"
keys[0x1a0] = "VIDEOPHONE"
keys[0x1a1] = "GAMES"
keys[0x1a2] = "ZOOMIN"
keys[0x1a3] = "ZOOMOUT"
keys[0x1a4] = "ZOOMRESET"
keys[0x1a5] = "WORDPROCESSOR"
keys[0x1a6] = "EDITOR"
keys[0x1a7] = "SPREADSHEET"
keys[0x1a8] = "GRAPHICSEDITOR"
keys[0x1a9] = "PRESENTATION"
keys[0x1aa] = "DATABASE"
keys[0x1ab] = "NEWS"
keys[0x1ac] = "VOICEMAIL"
keys[0x1ad] = "ADDRESSBOOK"
keys[0x1ae] = "MESSENGER"
keys[0x1af] = "DISPLAYTOGGLE"
#define KEY_BRIGHTNESS_TOGGLE KEY_DISPLAYTOGGLE
keys[0x1b0] = "SPELLCHECK"
keys[0x1b1] = "LOGOFF"

keys[0x1b2] = "DOLLAR"
keys[0x1b3] = "EURO"

keys[0x1b4] = "FRAMEBACK"
keys[0x1b5] = "FRAMEFORWARD"
keys[0x1b6] = "CONTEXT_MENU"
keys[0x1b7] = "MEDIA_REPEAT"
keys[0x1b8] = "10CHANNELSUP"
keys[0x1b9] = "10CHANNELSDOWN"
keys[0x1ba] = "IMAGES"

keys[0x1c0] = "DEL_EOL"
keys[0x1c1] = "DEL_EOS"
keys[0x1c2] = "INS_LINE"
keys[0x1c3] = "DEL_LINE"

keys[0x1d0] = "FN"
keys[0x1d1] = "FN_ESC"
keys[0x1d2] = "FN_F1"
keys[0x1d3] = "FN_F2"
keys[0x1d4] = "FN_F3"
keys[0x1d5] = "FN_F4"
keys[0x1d6] = "FN_F5"
keys[0x1d7] = "FN_F6"
keys[0x1d8] = "FN_F7"
keys[0x1d9] = "FN_F8"
keys[0x1da] = "FN_F9"
keys[0x1db] = "FN_F10"
keys[0x1dc] = "FN_F11"
keys[0x1dd] = "FN_F12"
keys[0x1de] = "FN_1"
keys[0x1df] = "FN_2"
keys[0x1e0] = "FN_D"
keys[0x1e1] = "FN_E"
keys[0x1e2] = "FN_F"
keys[0x1e3] = "FN_S"
keys[0x1e4] = "FN_B"

keys[0x1f1] = "BRL_DOT1"
keys[0x1f2] = "BRL_DOT2"
keys[0x1f3] = "BRL_DOT3"
keys[0x1f4] = "BRL_DOT4"
keys[0x1f5] = "BRL_DOT5"
keys[0x1f6] = "BRL_DOT6"
keys[0x1f7] = "BRL_DOT7"
keys[0x1f8] = "BRL_DOT8"
keys[0x1f9] = "BRL_DOT9"
keys[0x1fa] = "BRL_DOT10"

keys[0x200] = "NUMERIC_0"
keys[0x201] = "NUMERIC_1"
keys[0x202] = "NUMERIC_2"
keys[0x203] = "NUMERIC_3"
keys[0x204] = "NUMERIC_4"
keys[0x205] = "NUMERIC_5"
keys[0x206] = "NUMERIC_6"
keys[0x207] = "NUMERIC_7"
keys[0x208] = "NUMERIC_8"
keys[0x209] = "NUMERIC_9"
keys[0x20a] = "NUMERIC_STAR"
keys[0x20b] = "NUMERIC_POUND"
keys[0x20c] = "NUMERIC_A"
keys[0x20d] = "NUMERIC_B"
keys[0x20e] = "NUMERIC_C"
keys[0x20f] = "NUMERIC_D"

keys[0x210] = "CAMERA_FOCUS"
keys[0x211] = "WPS_BUTTON"

keys[0x212] = "TOUCHPAD_TOGGLE"
keys[0x213] = "TOUCHPAD_ON"
keys[0x214] = "TOUCHPAD_OFF"

keys[0x215] = "CAMERA_ZOOMIN"
keys[0x216] = "CAMERA_ZOOMOUT"
keys[0x217] = "CAMERA_UP"
keys[0x218] = "CAMERA_DOWN"
keys[0x219] = "CAMERA_LEFT"
keys[0x21a] = "CAMERA_RIGHT"

keys[0x21b] = "ATTENDANT_ON"
keys[0x21c] = "ATTENDANT_OFF"
keys[0x21d] = "ATTENDANT_TOGGLE"
keys[0x21e] = "LIGHTS_TOGGLE"

#define BTN_DPAD_UP 0x220
#define BTN_DPAD_DOWN 0x221
#define BTN_DPAD_LEFT 0x222
#define BTN_DPAD_RIGHT 0x223

keys[0x230] = "ALS_TOGGLE"
keys[0x231] = "ROTATE_LOCK_TOGGLE"

keys[0x240] = "BUTTONCONFIG"
keys[0x241] = "TASKMANAGER"
keys[0x242] = "JOURNAL"
keys[0x243] = "CONTROLPANEL"
keys[0x244] = "APPSELECT"
keys[0x245] = "SCREENSAVER"
keys[0x246] = "VOICECOMMAND"
keys[0x247] = "ASSISTANT"

keys[0x250] = "BRIGHTNESS_MIN"
keys[0x251] = "BRIGHTNESS_MAX"

keys[0x260] = "KBDINPUTASSIST_PREV"
keys[0x261] = "KBDINPUTASSIST_NEXT"
keys[0x262] = "KBDINPUTASSIST_PREVGROUP"
keys[0x263] = "KBDINPUTASSIST_NEXTGROUP"
keys[0x264] = "KBDINPUTASSIST_ACCEPT"
keys[0x265] = "KBDINPUTASSIST_CANCEL"

/* Diagonal movement keys */
keys[0x266] = "RIGHT_UP"
keys[0x267] = "RIGHT_DOWN"
keys[0x268] = "LEFT_UP"
keys[0x269] = "LEFT_DOWN"

keys[0x26a] = "ROOT_MENU"
/* Show Top Menu of the Media (e.g. DVD) */
keys[0x26b] = "MEDIA_TOP_MENU"
keys[0x26c] = "NUMERIC_11"
keys[0x26d] = "NUMERIC_12"
/*
 * Toggle Audio Description: refers to an audio service that helps blind and
 * visually impaired consumers understand the action in a program. Note: in
 * some countries this is referred to as "Video Description".
 */
keys[0x26e] = "AUDIO_DESC"
keys[0x26f] = "3D_MODE"
keys[0x270] = "NEXT_FAVORITE"
keys[0x271] = "STOP_RECORD"
keys[0x272] = "PAUSE_RECORD"
keys[0x273] = "VOD"
keys[0x274] = "UNMUTE"
keys[0x275] = "FASTREVERSE"
keys[0x276] = "SLOWREVERSE"
/*
 * Control a data application associated with the currently viewed channel,
 * e.g. teletext or data broadcast application (MHEG, MHP, HbbTV, etc.)
 */
keys[0x277] = "DATA"
keys[0x278] = "ONSCREEN_KEYBOARD"

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
#define KEY_MIN_INTERESTING KEY_MUTE
keys[0x2ff] = "MAX"
#define KEY_CNT (KEY_MAX+1)
