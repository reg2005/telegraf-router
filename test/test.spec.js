require('dotenv').config();
const bot1 = require("./../example/bot1");
const { defineRouterPath } = require("./../index");
const assert = require("assert");

describe("ROUTER TEST", async function() {
  it("PATH: /start", async function() {
    assert.equal(
      defineRouterPath({ctx: { updateType: 'message', message: {text: '/start'}}}),
      'start'
    )
  });
  it("PATH: relative path in callback_query", async function() {
    assert.equal(
      defineRouterPath({ route: 'select-action', ctx: { updateType: 'callback_query', update: { callback_query: {data: 'redirect:form/register'}}} }),
      'select-action/form/register'
    )
  });
  it("PATH: global path in callback_query", async function() {
    assert.equal(
      defineRouterPath({ route: 'register', ctx: { updateType: 'callback_query', update: { callback_query: { data: 'redirect:/form/register'}}} }),
      '/form/register'
    )
  });
});
