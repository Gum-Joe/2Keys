import add_keyboard
import sys

# IMPORTANT: Don't use non async functions in this.  That includes the logger
def gen_handler(keyboards):
  return def async handler():
    print("[DEBUG] STOPPING WATCH")
    for keyboard in keyboards:
      print("[DEBUG] ROOT: STOPPING " + keyboard.keyboard)
      await keyboard.stop_watch()
      return

add_keyboard(sys.argv[1] if len(sys.argv) > 1 else "keyboard_1", gen_handler)