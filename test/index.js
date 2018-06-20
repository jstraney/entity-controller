//// Controller Unit Tests ////
const assert = require('assert');

const fixtures = require('test/fixtures');

const axios = require('axios');

const {spawn} = require('child_process');

// rejects has been added as of nodejs v10. this is just a polyfill if you're using
// an older version. inspired by this stack overflow post
// https://bit.ly/2sAdMh9
assert.rejects = assert.rejects || (async (promise, regExp, message) => {

  var result, fn;

  try {

    result = await promise();

  } catch(e) {

    fn = () => { throw e };

  } 

  assert.throws(fn, regExp, message);

});


// as a corollary, I wrote this one too
assert.doesNotReject = assert.doesNotReject || (async (promise, regExp, message) => {

  var result;

  try {

    result = await promise();

  }
  catch (e) {

    throw new Error(message); 

  }

});


// set up the client driver
const client = axios.create({
  baseURL: 'http://localhost:3000'
});


// start up the application as a separate process
var server; 

const start_server = async () => {

  // will spin up server stub in separate process
  server = spawn('export NODE_PATH=. && node test/server', [], {
    stdio    : 'inherit',
    shell    : true,
  });

};


const log_result = (message) => {

  return (result) => {

    result = result || {};

    const data = result.data || result.message || "";

    console.log(message, data);
  } 

};


const send_client_requests = async () => {

  const {test_requests} = fixtures;

  console.log('client ready to send requests'); 

  test_requests.forEach((test_request, index) => {

    const {test_case, url, passes} = test_request;

    // if the test case claims to pass, expect it not to reject
    if (passes) {

      assert.doesNotReject(async () => {

        const result = await client.get(url)
        .then(log_result(test_case + ' succeeded'))
        .catch((e) => {

          const message = e.response && e.response.data.message? e.response.data.message : e.message;

          console.error(e);

          throw e;

        });

      }, Error, test_case + ' was rejected but should be fullfilled');

    }
    // if test case fails, expect a Promise rejection
    else {

      assert.rejects(async () => {

        await client.get(url)
        .catch((e) => {

          const message = e.response && e.response.data.message? e.response.data.message : e.message;

          console.error(test_case + ': error thrown as expected - ', message);

          throw e;

        });

      }, Error, test_case + ' did not reject as expected');

    }

  });
  
};


const stop_server = async (e) => {

  e.constructor === Error &&
    console.error(e);

  // send signal interupt
  server.kill('SIGINT');

};


// spawn is done asynchronously, and there's
// no simple way to check if the process
// has successfully opened a port
start_server()
.catch(stop_server);

// could spawn another process on an interval
// like lsof -i :<application_port>, but no

// for that reason, I set a simple timeout
// to begin sending requests after 2.5 sec
setTimeout(async () => {

  // probably ok to send out requests now
  send_client_requests()
  .then(stop_server)
  .catch(stop_server)

}, 2500);
