/**
 * Entry file for parsing cli
 * @param argv Args array provided to main function
 */

import java.util.*;
import org.apache.commons.lang3.ArrayUtils;
import org.apache.commons.cli.*;

public class CLI {
    
    /**
     * Parse options for the init command
     * @param args CLI args
     */
    private void parseInit(String[] args) {
        // Create Options
        Options options = new Options();
        options.addOption("dir", true, "Specifies the dir to copy the starter template to");
    }

    /**
     * Parse CLI to get command to run
     * @param args CLI args
     */
    public void startParse(String[] args) {
        // Step 1: Which commnd
        // First, is there any args
        if (args.length <= 0) {
            // Help text
            System.out.println("Commands:");
        } else if (args[0].equals("init")) {
            Debugger.log("Detected \"init\" as the command to run.  Parsing...");
            // Parse those args, first need to remove the command
            String[] newArgs = ArrayUtils.removeElement(args, args[0]);
            // Then we can hand over to Apache CLI
            this.parseInit(newArgs);
        }
    }
}