package com.gumjoe.twokeys.types;

// Type store for the local config
import java.util.HashMap;
import java.util.Map;
import com.gumjoe.twokeys.types.config.*;

public class LocalConfig {
    public String type;
    public Map<String, Keyboard> keyboards = new HashMap<String, Keyboard>();
    public Packs packs = new Packs();
}