package com.gumjoe.twokeys.types.config;

import java.util.HashMap;
import java.util.Map;

public class Keyboard {
    public String path; // Path to keyboard in /dev/input
    public String dir;
    public String root;
    public Map<String, String> map = new HashMap<String, String>();
}
