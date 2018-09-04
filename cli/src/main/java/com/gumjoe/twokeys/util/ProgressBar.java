package com.gumjoe.twokeys.util;

/**
 * Ascii progress meter. On completion this will reset itself,
 * so it can be reused
 * From https://masterex.github.io/archive/2011/10/23/java-cli-progress-bar.html
 * 100% ################################################## |
 */
public class ProgressBar {
  private StringBuilder progress;
  private int currentWorkChar = 0;

  /**
   * initialize progress bar properties.
   */
  public ProgressBar() {
    initProgress();
  }

  /**
   * Increment the current work char array index to use
   */
  private void incrementCurrentWorkChar() {
    if (this.currentWorkChar == 3) {
      this.currentWorkChar = 0;
    } else {
      this.currentWorkChar++;
    }
  }


  /**
   * called whenever the progress bar needs to be updated.
   * that is whenever progress was made.
   *
   * @param done an int representing the work done so far
   * @param total an int representing the total work
   */
  public void updateProgress(int done, int total) {
    char[] workchars = { '|', '/', '-', '\\' };
    String format = "\r%3d%% %s %c";

    int percent = (++done * 100) / total;
    int extrachars = (percent / 2) - this.progress.length();

    while (extrachars-- > 0) {
      progress.append(Character.toString((char) 219)); // Char: █ 219
    }
    System.out.printf(format, percent, progress, workchars[this.currentWorkChar]);
    this.incrementCurrentWorkChar();

    if (done == total) {
      System.out.flush();
      System.out.println();
      initProgress();
    }
  }

  private void initProgress() {
    this.progress = new StringBuilder(60);
  }
}