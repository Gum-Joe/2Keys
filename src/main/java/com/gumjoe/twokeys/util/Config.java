/**
 * Config parser for 2Keys
 */
package com.gumjoe.twokeys.util;

import java.nio.file.*;
import java.io.File;
import java.io.FileOutputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.io.InputStream;
import java.util.Properties;

import com.gumjoe.twokeys.util.Logger;

public class Config {
  // TODO: Add updateConfig() method
  public static Path defaultConfigPath = Paths.get(System.getProperty("user.home"), ".2keysrc.properties");
  /**
   * Read the config
   * @param configPath Config file path (a .rc file that has .properties syntax)
   */
  public static Properties readConfig(String configPath) {
    InputStream configFile = null;
    Properties config = new Properties();
    try {
      configFile = new FileInputStream(configPath);
      config.load(configFile);
    } catch (IOException err) {
      err.printStackTrace();
    } finally {
      if (configFile != null) {
        try {
          configFile.close();
        } catch (IOException err) {
          err.printStackTrace();
        }
      }
      return config;
    }
  }
}