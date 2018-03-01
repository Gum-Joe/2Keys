package com.gumjoe.twokeys.util;

import java.io.BufferedInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;
import java.net.URLConnection;
import java.nio.file.Path;

public class Downloader extends ProgressBar {
  /**
   * Downloads a file
   * @param url url to download
   * @param dest Path to download to
   */
  public void download(URL url, Path dest) {
    // DO stuff
    Logger.info("Downloading " + url + " to " + dest + "...");
    int count;
    try {
      // https://stackoverflow.com/questions/11447366/write-out-percentage-from-file-downloading
      Logger.debug("Opening a connection...");
      URLConnection connection = url.openConnection();
      // Set headers to prevent a 403
      connection.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:25.0) Gecko/20100101 Firefox/25.0");
      // getting file length
      int lenghtOfFile = connection.getContentLength();
      Logger.debug("Downloading...");
      // input stream to read file - with 8k buffer
      InputStream input = new BufferedInputStream(connection.getInputStream(), 8192);
      // Output stream to write file
      OutputStream output = new FileOutputStream(dest.toString());

      byte data[] = new byte[1024];
      int total = 0;

      while ((count = input.read(data)) != -1) {
        total += count;
        // updateing the progress....
        this.updateProgress(total, lenghtOfFile);

        // writing data to file
        output.write(data, 0, count);
      }

      // flushing output
      System.out.println("");
      Logger.debug("Saving...");
      output.flush();

      // closing streams
      output.close();
      input.close();
      connection.connect();
    } catch (IOException err) {
      err.printStackTrace();
    }
  }
}