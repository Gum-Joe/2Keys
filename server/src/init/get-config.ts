/**
 * @overview Gets user to answer some question for init, i.e. how many keyboard
 */
import inquirer from "inquirer";
import { Arguments } from "yargs";
import Logger from "../util/logger";
import { networkInterfaces, NetworkInterfaceInfo } from "os";
import { Config, Keyboard } from "../util/interfaces";
import { DEFAULT_HOTKEY_FILE_ROOT } from "../util/constants";

const logger: Logger = new Logger({
  name: "init"
});

const questions: inquirer.Questions = [
  {
    type: "input",
    name: "numberKeyboards",
    message: "How many keyboard do you wish to map?",
    default: 1,
  },
  {
    type: "confirm",
    name: "allow_ssh",
    message: "Allows us to SSH into the pi to run 2Keys commands?  This is for future use.",
    default: true,
  },
  {
    type: "input",
    name: "detector_ip",
    message: "What's the ipv4 address of your raspberry pi (the detector)?",
    validate: (input) => {
      return new Promise((resolve, reject) => {
        if (/^(.*).(.*).(.*).(.*)$/.test(input)) {
          resolve(true);
        } else {
          reject("Invalid ipv4 address format");
        }
      })
    }
  }
]

export default function (argv: Arguments): Promise<Config> {
  return new Promise(async (resolve, reject) => {
    // Add Q about ip address of local PC here
    // From https://stackoverflow.com/questions/3653065/get-local-ip-address-in-node-js
    const ifaces = networkInterfaces();
    const ip_choices: string[] = [];
    for (let ifname in ifaces) {
      const iface_root = ifaces[ifname];
      let aliases: number = 0; // To check if mutliple IPs
      for (let iface of iface_root) {
        if ('IPv4' !== iface.family || iface.internal !== false) {
          // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
          continue;
        } else if (aliases >= 1) {
          // this single interface has multiple ipv4 addresses
          ip_choices.push(`${ifname}, alias ${aliases}, ${iface.address}`);
        } else {
          // this interface has only one ipv4 adress
          ip_choices.push(`${ifname}, ${iface.address}`);
        }
        aliases++;
      }
    }
    questions.push({
      type: "list",
      name: "local_ip",
      message: "What is the ipv4 addres the detector should use to contact this PC?  NOTE: You'll need this for setup on the pi later.  If in doubt, ignore anything that says vEthernet",
      choices: ip_choices,
    }); // Push to array
    const answers: inquirer.Answers = await inquirer.prompt(questions);

    // Validate keyboards
    if (answers.numberKeyboards < 1) {
      logger.throw(new Error("Invalid number of keyboard! Make sure it at least 1."));
    }

    // Append keyboards
    const questions_keyboard: inquirer.Questions = [];
    for (let i = 1; i <= answers.numberKeyboards; i++) {
      questions_keyboard.push({
        type: "input",
        name: `keyboard_${i}`,
        message: `What is name for keyboard ${i}?`,
        default: `keyboard_${i}`,
      });
      questions_keyboard.push({
        type: "input",
        name: `keyboard_dir_${i}`,
        message: `What's the root dir for this keyboard's AutoHotkey scripts?`,
        default: `./Keyboard_${i}`,
      });
    }

    const answers_keyboards: inquirer.Answers = await inquirer.prompt(questions_keyboard);

    logger.info("Thanks for that.  Generating config...");
    const config: Config = {
      keyboards: {},
      addresses: {
        detector: answers.detector_ip,
        server: answers.local_ip.split(", ")[1] // Might be buggy
      },
      perms: {
        ssh: answers.allow_ssh,
      }
    }

    let i: number = 0;
    let current_keyboard_dir: string = "";
    let current_keyboard_name: string | undefined = "";
    while (i < questions_keyboard.length) {
      if (i % 2 == 0) {
        // On a keyboard dir
        const keyboard = questions_keyboard[i];
        logger.debug(`Added keyboard ${keyboard.name}...`)
        current_keyboard_name = keyboard.name;
      } else {
        // On a dir
        const keyboard = questions_keyboard[i];
        logger.debug(`Added keyboard dir ${keyboard.name}...`)
        current_keyboard_dir = answers_keyboards[keyboard.name];
        // Add to config
        config.keyboards[current_keyboard_name] = {
          path: "WAITING FROM DETECTOR",
          dir: current_keyboard_dir,
          root: DEFAULT_HOTKEY_FILE_ROOT
        }
      }
      // Check if at end
      if (i == questions_keyboard.length - 1) {
        // Return
        resolve(config);
      }
      // LOOP
      i++;
    }
  });
}