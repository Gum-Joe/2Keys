package com.gumjoe.twokeys.util;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

// http://www.codejava.net/java-se/file-io/programmatically-extract-a-zip-file-using-java
public class Zip {
  /**
   * Size of the buffer to read/write data
   */
  private static int BUFFER_SIZE = 4096;
  private String zipFilePath;
  private String destDirectory;

  public Zip(String zipFilePath, String destDirectory) {
    this.zipFilePath = zipFilePath;
    this.destDirectory = destDirectory;
  }

  /**
    * Extracts a zip file specified by the zipFilePath to a directory specified by
    * destDirectory (will be created if does not exists)
    * @param zipFilePath
    * @param destDirectory
    * @throws IOException
    */
  public void unzip() throws IOException {
    File destDir = new File(destDirectory);
    if (!destDir.exists()) {
      destDir.mkdir();
    }
    ZipInputStream zipIn = new ZipInputStream(new FileInputStream(zipFilePath));
    ZipEntry entry = zipIn.getNextEntry();
    // iterates over entries in the zip file
    while (entry != null) {
      String filePath = destDirectory + File.separator + entry.getName();
      if (!entry.isDirectory()) {
        // if the entry is a file, extracts it
        File dir = new File(Paths.get(filePath, "..").toString());
        if (!dir.exists()) {
          dir.mkdirs();
        }
        extractFile(zipIn, filePath);
      }
      zipIn.closeEntry();
      entry = zipIn.getNextEntry();
    }
    zipIn.close();
  }

  /**
   * Extracts a zip entry (file entry)
   * @param zipIn
   * @param filePath
   * @throws IOException
   */
  private void extractFile(ZipInputStream zipIn, String filePath) throws IOException {
    BufferedOutputStream bos = new BufferedOutputStream(new FileOutputStream(filePath));
    byte[] bytesIn = new byte[BUFFER_SIZE];
    int read = 0;
    while ((read = zipIn.read(bytesIn)) != -1) {
      bos.write(bytesIn, 0, read);
    }
    bos.close();
  }
}