import mkdirp from "mkdirp";
import { writeFile, writeFileSync } from "fs";
import { join } from "path";
import { Config } from "../util/interfaces";
import { DEFAULT_AHK_ROOT_CONTENTS } from "../util/constants";
import Logger from "../util/logger";

const logger = new Logger({
  name: "generate"
})

/**
 * @overview Generates files, such as keyboard roots and index.ahks
 */

 export default function gen_files(config: Config) {
   return new Promise((resolve, reject) => {
     // Get dirs & root
     const dirs: string[] = [];
     const roots: string[] = []; // index.ahks
     for (let keyboard in config.keyboards) {
       if (config.keyboards.hasOwnProperty(keyboard)) {
         dirs.push(config.keyboards[keyboard].dir);
         roots.push(join(config.keyboards[keyboard].dir, config.keyboards[keyboard].root));
       }
     }

     // CREATE
     for (let dir of dirs) {
       try {
         mkdirp.sync(dir);
         logger.debug(`Made dir ${dir}.`);
       } catch (err) {
         reject(err);
       }
     }

     for (let root of roots) {
       try {
         writeFileSync(root, DEFAULT_AHK_ROOT_CONTENTS);
         logger.debug(`Made root ${root}.`);
       } catch (err) {
         reject(err);
       }
     }

     resolve();
   });
 }