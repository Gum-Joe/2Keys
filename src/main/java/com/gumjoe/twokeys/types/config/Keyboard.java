package com.gumjoe.twokeys.types.config;

import java.util.HashMap;
import java.util.Map;

public class Keyboard {
    public String HID; // Adding this is handled by the C# app
    public String dir;
    public String root;
    public Map<String, String> map = new HashMap<String, String>();
}
