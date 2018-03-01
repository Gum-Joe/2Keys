/**
 * Entry file for parsing cli
 * @param argv Args array provided to main function
 */
package com.gumjoe.twokeys.cli;

import java.nio.file.*;
import org.apache.commons.lang3.ArrayUtils;
import org.apache.commons.cli.*;
import com.gumjoe.twokeys.commands.*;
import com.gumjoe.twokeys.util.*;

public class CLI {
    // To get args externally
    private static String[] savedArgs;
    public static String[] getArgs() {
        return savedArgs;
    }

    /**
     * Default options
     */
    private Options getDefaultOptions() {
        Options options = new Options();
        options.addOption(OptionBuilder.withLongOpt("debug")
            .withDescription( "Debug/verbose mode: logs all actions")
            .create()
        );
        options.addOption(OptionBuilder.withLongOpt("help")
            .withDescription("Print help (this message)")
            .create()
        );
        return options;
    }
    
    /**
     * Get init options
     */
    private Options getInitOpts() {
        // Create Options
        Options options = getDefaultOptions();
        options.addOption(OptionBuilder.hasArg()
            .withArgName("directory")
            .withLongOpt("dir")
            .withDescription("Specifies the directory to copy the starter template to")
            .create( "d" )
        );
        options.addOption(OptionBuilder.hasArg()
            .withArgName("directory")
            .withLongOpt("install-apps-to")
            .withDescription( "Location to install required software")
            .create()
        );
        return options;
    }
    
    /**
     * Get OOBE options
     */
    private Options getOOBEOpts() {
        // Create Options
        Options options = getDefaultOptions();
        options.addOption(OptionBuilder.withLongOpt("force")
            .withDescription("Force creation of files, irreguardless of if they exist")
            .create("f")
        );
        options.addOption(OptionBuilder.withLongOpt("clean")
            .withDescription("Cleans the .2Keys dir before OOBE")
            .create("c")
        );
        options.addOption(OptionBuilder.hasArg()
            .withArgName("directory")
            .withLongOpt("install-apps-to")
            .withDescription( "Location to install required software")
            .create()
        );
        return options;
    }

    /**
     * Parse options for the init command
     * @param args CLI args
     */
    public void parseInit(String[] args) {
        Options options = this.getInitOpts();
        // PARSE
        try {
            CommandLineParser parser = new DefaultParser();
            CommandLine parsed = parser.parse( options, args );
             
            // Print help?
            if (args.length <= 0 || parsed.hasOption("help")) {
                HelpFormatter formatter = new HelpFormatter();
                formatter.printHelp("2keys", options);
                System.exit(0);
            }

            // No help, start generating
            Init init = new Init();
            if (parsed.hasOption("directory")) {
                // Set dir
                init.setDir(parsed.getOptionValue("directory"));
            }

            if (parsed.hasOption("install-apps-to")) {
                // Set dir
                init.setInstallDir(parsed.getOptionValue("install-apps-to"));
            }

            init.run();
        } catch (ParseException err) {
            System.out.print("Error parsing cli args: " + err.getMessage());
        }

    }

    /**
     * Parse options for the oobe command
     * @param args CLI args
     */
    public void parseOOBE(String[] args) {
        Options options = this.getOOBEOpts();
        // PARSE
        try {
            CommandLineParser parser = new DefaultParser();
            CommandLine parsed = parser.parse(options, args);

            // Print help?
            if (args.length <= 0 || parsed.hasOption("help")) {
                HelpFormatter formatter = new HelpFormatter();
                formatter.printHelp("2keys", options);
                System.exit(0);
            }

            Path installPath = Init.OOBE.defaultInstallPath;

            if (parsed.hasOption("install-apps-to")) {
                Logger.debug("Install path has been specified");
                // Set install dir
                installPath = Paths.get(parsed.getOptionValue("install-apps-to"));
            }

            Init.OOBE oobe = new Init.OOBE(installPath);

            if (parsed.hasOption("force")) {
                Logger.debug("Force option has been specified");
                // Set install dir
                oobe.force();
            }

            if (parsed.hasOption("clean")) {
                Logger.debug("Clean option has been specified");
                // Set install dir
                oobe.clean();
            }

            // Run
            oobe.run();
            
        } catch (ParseException err) {
            System.out.print("Error parsing cli args: " + err.getMessage());
        }

    }

    /**
     * Parse CLI to get command to run
     * @param args CLI args
     */
    public void startParse(String[] args) {
        // Store args for access
        savedArgs = args;
        // Step 1: Which commnd
        // First, is there any args
        if (args.length <= 0) {
            // Help text
            System.out.println("Commands:");
        } else if (args[0].equals("init")) {
            Logger.debug("Detected \"init\" as the command to run.  Parsing...");
            // Parse those args, first need to remove the command
            String[] newArgs = ArrayUtils.removeElement(args, args[0]);
            // Then we can hand over to Apache CLI
            this.parseInit(newArgs);
        } else if (args[0].equals("oobe")) {
            Logger.debug("Detected \"oobe\" as the command to run.  Parsing...");
            // Parse those args, first need to remove the command
            String[] newArgs = ArrayUtils.removeElement(args, args[0]);
            // Then we can hand over to Apache CLI
            this.parseOOBE(newArgs);
        }
    }
}