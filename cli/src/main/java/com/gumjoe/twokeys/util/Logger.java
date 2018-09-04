/**
 * Logger for 2Keys
 */
package com.gumjoe.twokeys.util;

import java.util.Date;
import java.text.DateFormat;
import java.text.SimpleDateFormat;

import org.apache.commons.lang3.ArrayUtils;
import com.github.tomaslanger.chalk.Chalk;
import com.gumjoe.twokeys.cli.CLI;

public class Logger {
    public static boolean isEnabled(){
        String[] args = CLI.getArgs();
        if (ArrayUtils.contains(args, "--debug")) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Log method
     * @param level Log level (info/warn/error/debug)
     */
    private static void _log(Chalk level, Object text) {
        DateFormat df = new SimpleDateFormat("HH:mm:ss");
        Date dateobj = new Date();
        System.out.println(Chalk.on(df.format(dateobj)).magenta() + " " + level + " " + text);
    }

    public static void debug(Object out){
        if (Logger.isEnabled()) {
            Logger._log(Chalk.on("debug").cyan(), out);
        } 
    }

    public static void info(Object out) {
        Logger._log(Chalk.on("info").green(), out);
    }

    public static void warn(Object out) {
        Logger._log(Chalk.on("warn").yellow(), out);
    }

    public static void err(Object out) {
        Logger._log(Chalk.on("error").red(), out);
    }
}