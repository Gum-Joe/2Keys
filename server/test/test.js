const run_hotkey = require("../lib/util/ahk").run_hotkey;
async function test() { await run_hotkey("test.ahk", "TestFunc") };

test()