package com.gumjoe.twokeys.commands;

import com.gumjoe.twokeys.commands.Init;
import java.nio.file.*;
import org.apache.commons.lang3.*;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class InitTest {
    private Init init = new Init();

    @Test public void checkDirCanBeSet() {
        if (StringUtils.containsIgnoreCase(System.getProperty("os.name"), "Windows")) {
            String testDir = "./test/dir";
            Path testDirAsPath = Paths.get(".\\test\\dir");
            this.init.setDir(testDir);
            assertEquals(testDirAsPath, this.init.dir);
        }
    }

    @Test public void checkInstallDirCanBeSet() {
        if (StringUtils.containsIgnoreCase(System.getProperty("os.name"), "Windows")) {
            String testDir = "./test/dir";
            Path testDirAsPath = Paths.get(".\\test\\dir");
            this.init.setInstallDir(testDir);
            assertEquals(testDirAsPath, this.init.installPath);
        }
    }
}