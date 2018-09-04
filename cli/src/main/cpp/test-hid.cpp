#include <stdio.h>
#include <stdlib.h>
#include <windows.h>
#include <iostream>

#include "hidapi.h"

using namespace std;

int test_hid(int argc, char *argv[])
{
  int res;
  unsigned char buf[65];
  #define MAX_STR 255
  wchar_t wstr[MAX_STR];
  hid_device *handle;
  int i;

  // Enumerate and print the HID devices on the system
  struct hid_device_info *devs, *cur_dev;

  devs = hid_enumerate(0x0, 0x0);
  cur_dev = devs;
  while (cur_dev)
  {
    printf("Device Found\n  type: %04hx %04hx\n  path: %s\n  serial_number: %ls",
           cur_dev->vendor_id, cur_dev->product_id, cur_dev->path, cur_dev->serial_number);
    printf("\n");
    printf("  Manufacturer: %ls\n", cur_dev->manufacturer_string);
    printf("  Product:      %ls\n", cur_dev->product_string);
    printf("\n");
    cur_dev = cur_dev->next;
  }
  hid_free_enumeration(devs);
  return 0;
}

int main(int argc, char *argv[])
{
  typedef UINT (*pahktextdll)(LPTSTR script, LPTSTR opt, LPTSTR param); //typedef for a pointer to ahktextdll, used for calling an AHK function

  //Load AHK DLL
  HINSTANCE handle = LoadLibrary("D:\\Users\\Kishan\\Documents\\Projects\\2Keys\\lib\\ahkdll-v1-release-master\\Win32a\\AutoHotkey.dll");
  if (handle == NULL)
  {
    DWORD err = GetLastError();
    cout << "Error: " << err; //Error opening the dll.
  }
  else
  {
    //Get pointers to specific part we'll use
    pahktextdll ahktextdll = (pahktextdll)GetProcAddress(handle, "ahktextdll");
    LPTSTR empty = "";
    ahktextdll("MsgBox, 4,, Would you like to continue? (press Yes or No)", empty, empty);
  }
  return 0;
}