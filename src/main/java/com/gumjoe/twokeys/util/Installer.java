package com.gumjoe.twokeys.util;

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Creates an installer for software
 */
public class Installer extends Downloader {
    // Constants
    public static String TYPE_ZIP = "TYPE_ZIP";
    public static String TYPE_EXE = "TYPE_EXE";

    // Paths
    public Path installTo;  // Where to download to
    public URL url; // URL
    public String filename;
    private boolean verify = true; // Verify download (Hashing)

    public Installer(URL url, Path installPath, String filename) {
        // URL
        this.url = url;
        this.installTo = installPath;
        this.filename = filename;
        Logger.debug("URL: " + url);
        Logger.debug("Install location: " + installTo);
        Logger.debug("Filename " + filename);
    }

    /**
     * Start install
     * @param type Type of install (TYPE_ZIP/TYPE_EXE)
     */
    public void run(String type) {
        // Run general thing
        // MKDIR
        try {
            File dir = new File(this.installTo.toString());
            Logger.debug("Creating directory " + this.installTo + "...");
            dir.mkdirs();
        } catch (Exception err) {
            err.printStackTrace();
        } finally {
            // Check type
            if (type == Installer.TYPE_ZIP) {
                this.zipInstall();
            } else {
                new Error("Invalid type of install!").printStackTrace();
            }
        }
    }

    /**
     * Install from zip
     */
    private void zipInstall() {
        // Download zip
        this.download(this.url, Paths.get(this.installTo.toString(), this.filename));
    }
}
