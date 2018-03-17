/**package com.gumjoe.twokeys.commands;

import com.sun.jna.Library;
import com.sun.jna.Native;
import com.sun.jna.Platform;

public class Map {

  public static interface CLibrary extends Library {
    CLibrary INSTANCE = (CLibrary) Native.loadLibrary("main", CLibrary.class);
    int getKeyboardId();
  }

  public Map() {
    return;
  }

  public static void testMap() {
    System.setProperty("jna.library.path", "d:\\Users\\Kishan\\Documents\\Projects\\2Keys\\build\\libs\\main\\shared");
    //System.load("d:\\Users\\Kishan\\Documents\\Projects\\2Keys\\build\\libs\\main\\shared\\main.dll");
    System.out.println(Map.CLibrary.INSTANCE.getKeyboardId());
  }
}*/