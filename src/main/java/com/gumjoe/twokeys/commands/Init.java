package com.gumjoe.twokeys.commands;

import java.io.*;
import java.nio.file.*;
import java.net.URL;
import java.net.MalformedURLException;
import java.util.Properties;

import org.apache.commons.io.FileUtils;
import com.esotericsoftware.yamlbeans.*;
import com.gumjoe.twokeys.generators.*;
import com.gumjoe.twokeys.util.*;

public class Init {

    // Setting methods
    public Path dir = Paths.get("./");
    public Path installPath = OOBE.defaultInstallPath;
    private boolean force = false;

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
     * Force all parts of init to run
     */
    public void force() {
        this.force = !this.force;
    }

    /**
     * Generate local config
     */
    public void createLocalConfig() {
        try {
            YamlReader reader = new YamlReader(new FileReader("D:\\Users\\Kishan\\Documents\\Projects\\2Keys\\example\\config.yml"));
            Object object = reader.read();
            System.out.println(object);
        } catch {
            
        }

    }

    /**
     * Initalises boilerplate code
     */
    public void run() {
        // Run OOBE if needed
        Config config = new Config(Config.defaultConfigPath.toString());
        if (config.config.getProperty("general.oobe") == "true" || this.force) {
            Logger.debug("Running OOBE...");
            OOBE oobe = new Init.OOBE(this.installPath);
            if (this.force) {
                oobe.force();
            }
            oobe.run();
        }

        // Once OOBE done, detect keyboard
        this.createLocalConfig();
    }

    /**
     * OOBE class
     * used to install apps for second keyboard (AutoHotKey, Interception, LuaMacros etc)
     * @param installPath Path to install software to
     */
    public static class OOBE {
        // Constants
        public static Path defaultHome = Paths.get(System.getProperty("user.home"), ".2keys");
        public static Path defaultInstallPath = Paths.get(defaultHome.toString(), "apps"); // For Install command
        private Properties config;
        // Vars
        public Path installPath;
        public boolean force = false;
        public boolean clean = false;

        public OOBE(Path installPath) {
            this.installPath = installPath;
        }

        /**
         * Force creation of files (bypass ifs)
         */
        public void force() {
            this.force = !this.force;
        }

        /**
         * Clean 2Keys Home (general.home)
         */
        public void clean() {
            this.clean = !this.clean;
        }

        /**
         * Gets the config for 2Keys
         * @param configPath Config file path (.2Keysrc.properties)
         */
        public Properties genConfig(String configPath) {
            Logger.debug("Generating config...");
            Properties config = new Properties();
            config.setProperty("software.installPath", this.installPath.toString());
            config.setProperty("general.home", defaultHome.toString());
            config.setProperty("general.oobe", "true"); // Is OOBE in progress
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
            // Does AHK exist?
            try {
                URL AUTO_HOTKEY_URL = new URL("https", "autohotkey.com", "/download/ahk.zip"); // https://autohotkey.com/download/ahk.zip
                Installer ahk = new Installer(AUTO_HOTKEY_URL, Paths.get(installPath, "ahk"), "ahk.zip");
                ahk.run(Installer.TYPE_ZIP);
            } catch (MalformedURLException err) {
                System.err.println(err);
            }
        }

        /**
         * Cleans home dir
         * @param home Home dir (config: general.home)
         */
        public void cleanHome(String home) {
            Logger.info("Cleaning out 2Keys Home (" + config.getProperty("general.home") + ")...");
            File homedir = new File(home);
            try {
                FileUtils.deleteDirectory(homedir);
            } catch (IOException err) {
                err.printStackTrace();
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
            config = Config.readConfig(configFile.getAbsolutePath());
            // Clean?
            if (this.clean) {
                this.cleanHome(config.getProperty("general.home"));
            }
            // Get install location
            String installPath = config.getProperty("software.installPath");
            this.installSoftware(installPath);

            // Finalise
            Logger.info("Finalising...");
            Logger.debug("Finishing OOBE by editing config...");
            Config config = new Config(Config.defaultConfigPath.toString());
            config.config.setProperty("general.oobe", "false");
            config.writeConfig();
        }
    }
}