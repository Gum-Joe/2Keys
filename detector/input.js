/**
 * @overview Attempt to get input nodejs
 */
const { readFile } = require("fs");
const struct = require('python-struct');

console.log("READING")
while (true) {
  readFile("/dev/input/event0", (err, data) => {
    if (err) throw err;
    const read_data = struct.unpack("llHHI", data);
    console.log(read_data);
  });
}
