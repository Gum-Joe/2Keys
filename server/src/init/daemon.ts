/**
 * @overview Adds the hotkeys server to windows startup
 */
import { join } from "path";
import { Service } from "node-windows";
import mkdirp from "mkdirp";
import { WINDOWS_DAEMON_PREFIX, DEFAULT_LOCAL_2KEYS, WINDOWS_DAEMON_FILE, WINDOWS_DAEMON_PID_FILE, WINDOWS_DAEMON_FILE_JS_TEMPLATE, WINDOWS_DAEMON_FILE_VBS_TEMPLATE, WINDOWS_DAEMON_FILE_VBS } from "../util/constants";
import Logger from "../util/logger";
import { writeFileSync, readFile, symlinkSync, readFileSync } from "fs";
import { exec } from "child_process";


const Mustache = require("mustache");

const logger = new Logger({
  name: "startup"
});

/**
 * Hacky way to generate daemon startup JS
 * @param name Name of 2Keys project, from config
 */
function gen_startup_js(name: string): string {
  const output = Mustache.render(readFileSync(WINDOWS_DAEMON_FILE_JS_TEMPLATE).toString("utf8"), {
    root: process.cwd().split("\\").join("\\\\"),
    name,
    default_local_twokeys: DEFAULT_LOCAL_2KEYS,
    daemon_pid_file: WINDOWS_DAEMON_PID_FILE
  });
  return output;
  // NEED A BETTER WAY TO DO THIS
return `/**
 * File auto-generated by 2Keys
 * Used for windows service to start 2Keys server
 * Project name:
 * Root dir:
 * DO NOT MODIFY
 */
const { spawn } = require("child_process");
const { createWriteStream, writeFileSync } = require("fs");
const { join } = require("path");

const root = "${process.cwd().split("\\").join("\\\\")}";

// CHDIR to root
process.chdir(root);

// Create log file
console.log("Creating log file...");
const date = new Date();
const logger = createWriteStream(join(root, "${DEFAULT_LOCAL_2KEYS}", \`\${ date.getFullYear() }.\${ date.getMonth() }.\${ date.getDate() } \${ date.getHours() }.\${ date.getMinutes() }.\${ date.getSeconds() }.log\`))

// PID file
console.log("Creating a PID file for this process...");
const pid = writeFileSync(join(root, ".2Keys", "${WINDOWS_DAEMON_PID_FILE}"), process.pid);

console.log("Starting 2Keys server for ${name}...");
const server = spawn("2Keys", ["serve"], {
  shell: true,
  env: {
    "DEBUG": "*",
  },
});

server.stdout.on("data", (data) => {
  logger.write(data);
});

server.stderr.on("data", (data) => {
  logger.write(data);
});

server.on("close", (code) => {
  console.log(\`child process exited with code \${ code }\`);
  process.exit(code);
});

server.on("error", (err) => {
  console.error("Failed to start subprocess.");
  process.exit(1);
});`
}

/**
 * Generates .vbs startup script for shell:startup
 */
function gen_startup_vbs(name: string) {
  const output = Mustache.render(readFileSync(WINDOWS_DAEMON_FILE_VBS_TEMPLATE).toString("utf8"), {
    daemon: join(process.cwd(), DEFAULT_LOCAL_2KEYS, WINDOWS_DAEMON_FILE),
    name,
  });
  return output;
  return `' FILE AUTO-GENERATED BY 2KEYS
' DO NOT MODIFY
Set oShell = CreateObject("Wscript.Shell") 
Dim strArgs
strArgs = "cmd /c node ${join(process.cwd(), DEFAULT_LOCAL_2KEYS, WINDOWS_DAEMON_FILE)}"
oShell.Run strArgs, 0, false
`
}

/**
 * Stop 2Keys daemon
 */
export function stop_daemon() {
  return new Promise((resolve, reject) => {
    logger.info("Stopping 2Keys startup daemon...");
    logger.debug("Reading .pid file...")
    readFile(join(process.cwd(), DEFAULT_LOCAL_2KEYS, WINDOWS_DAEMON_PID_FILE), (err, pid) => {
      if (err) logger.throw(err);
      logger.debug(`PID: ${pid.toString()}`);
      logger.debug("Killing...");
      process.kill(parseInt(pid.toString()));
      resolve();
    });
  });
}

/**
 * Starts 2Keys daemon
 */
export function start_daemon() {
  logger.info("Starting 2Keys daemon...");
  logger.info(`See logs in ${join(process.cwd(), DEFAULT_LOCAL_2KEYS)} for logs.`)
  exec(join(process.cwd(), DEFAULT_LOCAL_2KEYS, WINDOWS_DAEMON_FILE_VBS), {}, (error, stdout, stderr) => {
    if (error) {
      logger.throw(error);
    }
    logger.info("2Keys daemon now running.");
  });
}

/**
 * Creates a new daemon
 * Creates a daemon starter js file in root/.2Keys/daemon.js
 * A daemon Visual Basic startup script in shell:startup/2Keys-name.vbs
 * And symlinks the .vbs for the start, stop and restart commands
 * @param name Name of 2Keys project, from config
 */
export default function add_to_startup(name: string) {
  logger.debug("Making files...");
  // Create required dirs
  try {
    mkdirp.sync(join(process.cwd(), DEFAULT_LOCAL_2KEYS));
    logger.debug(`Made dir ${join(process.cwd(), DEFAULT_LOCAL_2KEYS)}...`);
  } catch (err) {
    logger.throw(err);
  }

  const VBS_SCRIPT = join(process.env.APPDATA, "Microsoft", "Windows", "Start Menu", "Programs", "Startup", `${WINDOWS_DAEMON_PREFIX}${name}.vbs`);
  // Create service file
  try {
    logger.debug(`Creating daemon startup js file ${WINDOWS_DAEMON_PREFIX}${name}...`);
    writeFileSync(join(process.cwd(), DEFAULT_LOCAL_2KEYS, WINDOWS_DAEMON_FILE), gen_startup_js(name));

    logger.debug("Adding a .vbs script to .2Keys fore startup...")
    // writeFileSync(join(process.env.APPDATA, "Microsoft", "Windows", "Start Menu", "Programs", "Startup", `${WINDOWS_DAEMON_PREFIX}${name}.vbs`), gen_startup_vbs());
    writeFileSync(join(process.cwd(), DEFAULT_LOCAL_2KEYS, WINDOWS_DAEMON_FILE_VBS), gen_startup_vbs(name));
    logger.debug("Symlinking this .vbs script into user startup folder...");
    symlinkSync(join(process.cwd(), DEFAULT_LOCAL_2KEYS, WINDOWS_DAEMON_FILE_VBS), VBS_SCRIPT);
  } catch (err) {
    logger.throw(err);
  }
}