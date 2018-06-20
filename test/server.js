////// SERVER STUB
// server stub for the test client. runs in spawned process
const controller = require('../index.js');

const assert = require('assert');

// used in examples
const crypto = require('crypto');

console.log("\n\nRunning unit test on " + new Date().toString() + ". Buckle up, nerd.");

// Make sure this is defined. copy fixtures.example.js into fixtures.js
const fixtures = require('test/fixtures');

// in actual use, you simply open a connection to mongo, mysql,
// wherever your data is stored
const users_data = fixtures.users; 

const actions = {};

actions.read = {};

actions.read.on_validate = async(params) => {

  const {id} = params;

  if (Number.isNaN(+id))
    throw new Error('id expected to be a number');

};

actions.read.on_query = async (params) => {

  const {id} = params;

  return users_data[id];

};

actions.create = {}
actions.create.on_pre_validate = async (params) => {

  params.favorite_color = params.favorite_color || "blue";

};

actions.create.on_query = async (params) => {

  const {email, username, favorite_color}  = params;

  users_data.push({email, username, favorite_color});

  // id of created user
  return {id : users_data.length - 1};

};

const user_controller = controller(actions);

// get middleware from controller
const {handle_action} = user_controller;

const express = require('express')
      app = express();

app.use(express.urlencoded({extended: false}));
app.use(express.json());

// uses default handlers for middleware 'on_result', 'on_err'
app.get('/users/:id', handle_action('read'));

app.listen(3000, '127.0.0.1', () => {

  console.log('Server test stub running for entity controller');
  
});
