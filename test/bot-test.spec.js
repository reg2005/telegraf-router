require('dotenv').config();
const bot1 = require("./../example/bot1");
const assert = require("assert");
const tgKey = process.env.TG_API_KEY

describe("ROUTER TEST", async function() {
  it("FIRST BOT", async function() {
    await bot1(tgKey)
    // await wait(50000)
  }).timeout(0);
  
});
