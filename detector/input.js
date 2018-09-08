/**
 * @overview Attempt to get input nodejs
 */
const { readFile, watch } = require("fs");
const struct = require('python-struct');

console.log("READING")

watch("/dev/input/event0", { encoding: null }, (eventType) => {
  console.log(`event: ${eventType}`);
  readFile("/dev/input/event0", { encoding: null }, (err, data) => {
    if (err) throw err;
    const read_data = struct.unpack("llHHI", data);
    console.log(read_data);
  });
});

