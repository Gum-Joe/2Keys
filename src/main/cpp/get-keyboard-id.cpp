/**
 * Map the keyboard using interception
 * Boilerplate from http://www.oblita.com/interception 
 */
#include <iostream>
#include <windows.h>
#include <interception.h>
#include "get-keyboard-id.hpp"

enum ScanCode {
  SCANCODE_ESC = 0x01
};

int getKeyboardId() {
  // Allow strings usage
  using namespace std;

  // Init vars
  InterceptionContext context;
  InterceptionDevice device;
  InterceptionStroke stroke;

  wchar_t hardware_id[500];

  SetPriorityClass(GetCurrentProcess(), HIGH_PRIORITY_CLASS);

  // Init interception
  context = interception_create_context();

  // Look for devices
  interception_set_filter(context, interception_is_keyboard, INTERCEPTION_FILTER_KEY_DOWN | INTERCEPTION_FILTER_KEY_UP);
  // interception_set_filter(context, interception_is_mouse, INTERCEPTION_FILTER_MOUSE_LEFT_BUTTON_DOWN); // Mouse not supproted

  // Wait for key down
  while (interception_receive(context, device = interception_wait(context), &stroke, 1) > 0) {
    if (interception_is_keyboard(device)) {
      InterceptionKeyStroke &keystroke = *(InterceptionKeyStroke *)&stroke;

      if (keystroke.code == SCANCODE_ESC)
        break;
    }

    // Get the hardware id
    size_t length = interception_get_hardware_id(context, device, hardware_id, sizeof(hardware_id));

    // Print it, really should return this
    if (length > 0 && length < sizeof(hardware_id))
      cout << hardware_id << endl;

    // Don't block pressing of key
    interception_send(context, device, &stroke, 1);
  }

  // Stop interception
  interception_destroy_context(context);

  return 0;
}
