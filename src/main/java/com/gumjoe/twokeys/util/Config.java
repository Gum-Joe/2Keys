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
  /**
  * Config properties:
  * software.installPath: Install location for hotkey software (AutoHotKey etc)
  */
  
  // TODO: Add updateConfig() method
  public static Path defaultConfigPath = Paths.get(System.getProperty("user.home"), ".2keysrc.properties");
  public Properties config;
  private String configPath;

  public Config(String configPath) {
    this.configPath = configPath;
    this.config = Config.readConfig(this.configPath);
  }

  public Properties readConfig() {
    return Config.readConfig(this.configPath);
  }

  public boolean writeConfig() {
    return Config.writeConfig(this.configPath, this.config);
  }

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

  /**
   * Write config
   * @param configPath String of path to write config to
   * @param config Config properties to write
   */
  public static boolean writeConfig(String configPath, Properties config) {
    OutputStream output = null;
    // Write
    try {
      Logger.debug("Writing config...");
      output = new FileOutputStream(configPath);
      config.store(output, null);
    } catch (IOException err) {
      err.printStackTrace(); // TODO: Replace with Logger.throw()
      return false;
    } finally {
      if (output != null) {
        try {
          output.close();
          return true;
        } catch (IOException err) {
          err.printStackTrace();
          return false;
        }
      }
    }
    return false;
  }
}