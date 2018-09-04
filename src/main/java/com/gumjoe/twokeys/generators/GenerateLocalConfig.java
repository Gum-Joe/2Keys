package com.gumjoe.twokeys.generators;

// Generates default config
import java.util.ArrayList;

import com.gumjoe.twokeys.types.*;
import com.gumjoe.twokeys.types.config.*;


public class GenerateLocalConfig {
    public static LocalConfig genDefaultConfig() {
        LocalConfig config = new LocalConfig();
        Keyboard default_keyboard = new Keyboard();
        default_keyboard.path = "WAITING";
        default_keyboard.dir = "./";
        default_keyboard.root = "index.ahk";
        config.keyboards.put("keyboard", default_keyboard);
        return config;
    }

    public static LocalConfig exampleConfig() {
        // Create new Config
        LocalConfig config = new LocalConfig();
        config.type = "multi";
        Keyboard keyboard1 = new Keyboard();
        keyboard1.path = "sadasd";
        keyboard1.dir = "C:\\";
        keyboard1.root = "./K1";
        keyboard1.map.put("A", "Add.ahk");
        config.keyboards.put("Keyboard_1", keyboard1);
        config.packs.repos.put("github",  "github.com");
        config.packs.repos.put("twokeys",  "repo.twokeys.com");
        config.packs.repos.put("npm",  "npm.com");
        ArrayList packages = new ArrayList();
        packages.add("2Keys-program-JS");
        packages.add("2Keys-video-edit-premiere");
        packages.add("2Keys-standard-firefox");
        config.packs.install.put("npm", packages);
        return config;
    }
}
