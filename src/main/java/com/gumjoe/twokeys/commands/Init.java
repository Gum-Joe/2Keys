package com.gumjoe.twokeys.commands;

import java.nio.file.*;
import java.io.File;
import java.io.FileOutputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.net.URL;
import java.net.MalformedURLException;
import java.io.InputStream;
import java.util.Properties;

import com.gumjoe.twokeys.util.*;

public class Init {
    // Setting methods
    public Path dir = Paths.get("./");
    public Path installPath = OOBE.defaultInstallPath;

    /**
     * Set the directory to init it
     * @param dir Directory to copy files to
     */
    public void setDir(String dir) {
        this.dir = Paths.get(dir);
    }

    /**
     * Set the directory to download programs to
     * @param installPath Directory to download programs to
     */
    public void setInstallDir(String installLoc) {
        this.installPath = Paths.get(installLoc);
    }

    /**
     * Initalises boilerplate code
     */
    public void run() {
        // Verify programs
        OOBE oobe = new Init.OOBE(this.installPath);
        oobe.run();
    }

    /**
     * OOBE class
     * used to install apps for second keyboard (AutoHotKey, Interception, LuaMacros etc)
     * @param installPath Path to install software to
     */
    public static class OOBE {
        // Constants
        public static Path defaultInstallPath = Paths.get(System.getProperty("user.home"), ".2keys", "apps"); // For Install command
        // Vars
        public Path installPath;
        public boolean force = false;

        public OOBE(Path installPath) {
            this.installPath = installPath;
        }

        /**
         * Force creation of files (bypass ifs)
         */
        public void force() {
            this.force = true;
        }

        /**
         * Gets the config for 2Keys
         * @param configPath Config file path (.2Keysrc.properties)
         */
        public Properties genConfig(String configPath) {
            Logger.debug("Generating config...");
            Properties config = new Properties();
            config.setProperty("software.installPath", this.installPath.toString());
            return config;
        }

        /**
         * Creates the config for 2Keys
         * @param configPath Config file path (.2Keysrc.properties)
         */
        public void createConfig(String configPath) {
            Logger.debug("Creating config...");
            Properties config = this.genConfig(configPath);
            OutputStream output = null;
            // Write
            try {
                Logger.debug("Writing config...");
                output = new FileOutputStream(Config.defaultConfigPath.toString());
                config.store(output, null);
            } catch (IOException err) {
                err.printStackTrace();  // TODO: Replace with Logger.throw()
            } finally {
                if (output != null) {
                    try {
                        output.close();
                    } catch (IOException err) {
                        err.printStackTrace();
                    }
                }
            }
        }

        /**
         * Install required software
         * @param installPath Installation path (software.installPath)
         */
        public void installSoftware(String installPath) {
            try {
                URL AUTO_HOTKEY_URL = new URL("https", "autohotkey.com", "/download/ahk.zip"); // https://autohotkey.com/download/ahk.zip
                Installer ahk = new Installer(AUTO_HOTKEY_URL, Paths.get(installPath, "ahk"), "ahk.zip");
                ahk.run(Installer.TYPE_ZIP);
            } catch (MalformedURLException err) {
                System.err.println(err);
            }
        }

        // Run OOBE
        public void run() {
            Logger.info("Starting OOBE...");
            Logger.debug("Checking for a config...");
            // Check if config exists
            File configFile = new File(Config.defaultConfigPath.toString());
            if (!configFile.exists() || this.force) {
                this.createConfig(configFile.getAbsolutePath()); // Helped by https://www.mkyong.com/java/java-properties-file-examples/ 
            }
            Logger.debug("Reading config...");
            Properties config = Config.readConfig(configFile.getAbsolutePath());
            // Get install location
            String installPath = config.getProperty("software.installPath");
            this.installSoftware(installPath);
        }
    }
}