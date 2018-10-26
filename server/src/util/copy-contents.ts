import Logger from "./logger";

// Copy the contents of dir -> dir

const logger = new Logger({
  name: "copy"
});

export default function copy_contents(root: string, destination: string): void {
  logger.info(`Copying files from ${root} to ${destination}...`);
  copyDirContentsTo(root, destination, {
    ignore: []
  });
}

// Below from https://github.com/Gum-Joe/coapack/blob/master/packages/coapack-core/copy/index.js
// File to copy over setup
import chalk from "chalk";
import fs, { readdir as readdirRaw } from "fs";
import mkdirp from "mkdirp";
import path from "path";
import ProgressBar from "progress";
import { promisify } from "util";
import { FileCopyOpts } from "./interfaces";

const readdir = promisify(readdirRaw)

// From http://stackoverflow.com/questions/10152650/javascript-match-regular-expression-against-the-array-of-items
/**
 * 
 * @param string Match string against regexp array
 * @param expressions 
 */
function matchRegexArray(string: string, expressions: RegExp[]): boolean {
  const len = expressions.length;
  for (let i = 0; i < len; i++) {
    if (string.match(expressions[i])) {
      return true;
    }
  }
  return false;
};

/**
 * Gets file tree
 * @param dirs Array of dirs in root
 * @param root Root path
 * @param options Options object from copy root function
 */
function getFiles(dirs: string[], root: string, options: FileCopyOpts): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const finalDirs: string[] = [];
    for (let dir of dirs) {
      try {
        const status = fs.statSync(path.join(root, dir));
        if (!matchRegexArray(dir, options.ignore) && status.isDirectory()) {
          // File is dir
          const thisDirDirs = fs.readdirSync(path.join(root, dir));
          finalDirs.push(path.join(root, dir));
          getFiles(thisDirDirs, path.join(root, dir), options)
            .then(results => results.map(entry => path.join(root, entry)));
        } else {
          // Append
          finalDirs.push(path.join(root, dir));
        }
      } catch (err) {
        reject(err);
      }
    }
    resolve(finalDirs);
  })
};

/**
 * @description Copies dir contents to destination
 * @param source Source dir
 * @param destination destination
 * @param options Options object
 */
async function copyDirContentsTo(source: string, destination: string, options: FileCopyOpts) {
  const dirsInSource = await readdir(source);
  let finalDirs: string[] = await getFiles(dirsInSource, source, options);
  // Resolve files & filter out dirs or files
  finalDirs = finalDirs.map(dir => path.isAbsolute(dir) ? dir : path.resolve(path.join(source, dir)));
  let allDirs = finalDirs.filter(dir => fs.statSync(dir).isDirectory());
  finalDirs = finalDirs.filter(dir => !fs.statSync(dir).isDirectory());
  finalDirs = finalDirs.map(dir => path.isAbsolute(dir) ? dir : path.resolve(path.join(destination, dir)));
  allDirs = allDirs.map(dir => path.resolve(path.join(destination, path.relative(source, dir))));
  allDirs = allDirs.filter(dir => !matchRegexArray(dir, options.ignore));

  // Hacky solution to fix issue where dir would not copy if no subdris
  allDirs.unshift(source);

  // Counts
  const filesToCopy = finalDirs.length;
  const dirsToMake = allDirs.length;

  // Copy
  // Read file and write
  // Make directories
  function mkDirs(pb) {
    return new Promise(async function (resolve, reject) {
      for (let dir of allDirs) {
        if (!matchRegexArray(dir, options.ignore)) {
          mkdirp(dir, (err) => {
            if (err) {
              reject(err);
            }
            pb.tick({
              source: "mkdirp",
              sign: ">>",
              dest: path.relative(process.cwd(), dir)
            });
            if (dir === allDirs[allDirs.length - 1]) {
              resolve();
            }
          });
        }
      }
    });
  }

  // XXX: This fails on first run, saying one dir could not be copied
  function copyFiles(pb) {
    // Copy files
    return new Promise(async function (resolve, reject) {
      for (let file of finalDirs) {
        // Error handler
        const handleError = (err) => {
          read.destroy();
          write.end();
          logger.throw(err);
        };
        // destination
        const dest = path.join(destination, path.relative(source, file)); /* Get file name and append to destination */
        // Copy
        const read = fs.createReadStream(file); // Create read stream
        read.on("error", handleError); // Handle error
        const write = fs.createWriteStream(dest); // Create write stream
        write.on("error", handleError); // Handle error
        write.on("finish", () => {
          pb.tick({
            source: path.relative(source, file),
            dest: path.relative(source, dest),
            sign: "->"
          });
          read.destroy();
          write.end();
        }); // What to do when done
        await read.pipe(write); // Run copy
      }
    });
  }

  return new Promise(async (resolve, reject) => {
    // Progress bar
    let pb = new ProgressBar(`:bar :percent :current/:total :source :sign :dest ETA: :eta`, {
      total: filesToCopy + dirsToMake,
      complete: "█",
      incomplete: "▒",
      width: 50,
      callback: () => { console.log(""); /* Log \n for neatness */ resolve(); }
    });
    await mkDirs(pb)
      .then(() => copyFiles(pb))
      .catch(err => reject(err));
  });

}