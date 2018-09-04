# Code originally from https://stackoverflow.com/questions/5060710/format-of-dev-input-event
# I don't know how to handle structs, so i'm just leaving as is (i.e. in Python)
# Would be better if in Java (like rest of project), C++/C (native code), JS (like server)
# as it means rest of pi side might have to be in python 
#
# See https://github.com/torvalds/linux/blob/master/include/uapi/linux/input-event-codes.h for codes 
# and https://www.kernel.org/doc/Documentation/input/event-codes.txt for meanings

import struct
import time
import sys

infile_path = "/dev/input/event" + (sys.argv[1] if len(sys.argv) > 1 else "0") # File for input that corresponds to the keyboard.  Should use human readable ones in /dev/input/by-id

#long int, long int, unsigned short, unsigned short, unsigned int
FORMAT = 'llHHI'
EVENT_SIZE = struct.calcsize(FORMAT)

#open file in binary mode
in_file = open(infile_path, "rb")

event = in_file.read(EVENT_SIZE) # Open input file

# Array of pressed keys
# is array of booleans, with the index = key code
# i.e. if pressed_or_not[2] == true, then 2 has been pressed down.  Once set to false, the key has been 'unpressed'
pressed_or_not = [False] * 256 # Linux lists key codes 0 to 255

while event:
    (tv_sec, tv_usec, type, code, value) = struct.unpack(FORMAT, event)
    print(type)

    # We only want event type 1, as that is a key press
    # If key is already pressed, ignore event provided value not 0 (key unpressed)
    if (type == 1 or type == 0x1) and (pressed_or_not[code] == False or value == 0):
      print("Key pressed. Code %u, value %u at %d.%d" %
            (code, value, tv_sec, tv_usec))
      # Set key in array
      pressed_or_not[code] = not pressed_or_not[code]
      # Now, need some way to prvent hot key execution over and over whilst keys held
    #elif type != 0 or code != 0 or value != 0:
    #    print("Event type %u, code %u, value %u at %d.%d" % \
    #        (type, code, value, tv_sec, tv_usec))
    else:
        # Events with code, type and value == 0 are "separator" events
        print("===========================================")

    event = in_file.read(EVENT_SIZE)

in_file.close()
