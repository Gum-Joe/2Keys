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

// This works
int main(int argc, char *argv[])
{

  // From https://autohotkey.com/board/topic/96666-tutorial-c-and-autohotkey/

  //Typedef the functions
  typedef BOOL (*pahkReady)(void);
  typedef BOOL (*pahkExec)(LPTSTR script);
  typedef UINT (*pahkdll)(LPTSTR script, LPTSTR p1, LPTSTR p2);

  // Load
  HINSTANCE handle = LoadLibrary("D:\\Users\\Kishan\\Documents\\Projects\\2Keys\\cli\\lib\\ahkdll-v1-release-master\\Win32a\\AutoHotkey.dll");

  // pointers
  pahkdll ahkdll = (pahkdll)GetProcAddress(handle, "ahkdll");
  pahkReady ahkReady = (pahkReady)GetProcAddress(handle, "ahkReady");
  pahkExec ahkExec = (pahkExec)GetProcAddress(handle, "ahkExec");

  //free memory
  ahkdll("", "", "");

  // debug
  while (!ahkReady())
    Sleep(10);

  ahkExec("Msgbox IT WORKS ");
  return 0;
}