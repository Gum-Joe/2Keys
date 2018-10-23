import Logger from "./logger";

// Copy the contents of dir -> dir

const logger = new Logger({
  name: "copy"
});

export default function copy_contents(root: string, destination: root): void {
  logger.info(`Copying files from ${root} to ${destination}...`);
}