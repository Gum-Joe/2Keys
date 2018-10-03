/**
 * @overview Gets user to answer some question for init, i.e. how many keyboard
 */
import inquirer from "inquirer";
import { Arguments } from "yargs";
import Logger from "../util/logger";

const logger: Logger = new Logger({
  name: "init"
});

const questions: inquirer.Questions = [
  {
    type: "input",
    name: "numberKeyboards",
    message: "How many keyboard do you wish to map?",
    default: 1,
  }
]

export default async function (argv: Arguments) {
  const answers: inquirer.Answers = await inquirer.prompt(questions);

  // Validate keyboards
  if (answers.numberKeyboards < 1) {
    logger.throw(new Error("Invalid number of keyboard! Make sure it at least 1."));
  }

  // Append keyboards
  const questions_keyboard: inquirer.Questions = [
    {
      type: "input",
      name: "pi_ip",
      message: "What's the ipv4 address of your raspberry pi (the detector)?"
    }
  ];
  for (let i = 1; i <= answers.numberKeyboards; i++) {
    questions_keyboard.push({
      type: "input",
      name: `keyboard_${i}`,
      message: `What is name for keyboard ${i}?`,
      default: `keyboard_${i}`,
    });
  }

  const answers_keyboards: inquirer.Answers = await inquirer.prompt(questions_keyboard);

}