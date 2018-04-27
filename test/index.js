//// Controller Unit Tests ////
const controller = require('../index.js');

const assert = require('assert');

// used in examples
const crypto = require('crypto');

console.log("\n\nRunning unit test on " + new Date().toString() + ". Buckle up, nerd.");

// in actual use, you simply open a connection to mongo, mysql,
// wherever your data is stored
const users_data = { 
  "test1@gmail.com" : {
    username: "test1",
    favorite_color: "red",
  },
  "test2@gmail.com" : {
    username: "test2",
    favorite_color: "blue",
  },
  "test3@gmail.com" : {
    username: "test3",
    favorite_color: "green",
  }
};

// each action has its own hooks (callbacks if you prefer)
// called in this order:
// on_pre_validate
// on_validate
// on_post_validate
// on_pre_query
// on_query
// on_post_query
//
// each action is guaranteed to return a promise, as they are
// treated as async when passed in.
const user_controller = controller({
  read: {
    on_pre_validate: async function (params) {

      // derive parameters from input, just a non practical example
      // but you could, take a hash of two submitted values
      const hash = crypto.createHash("sha256");

      // note to noobs, this is not an encryption example
      hash.update(params.email);
      hash.update(crypto.randomBytes(32));
      params.some_key = hash.digest("hex");

    },
    on_validate : async function (params) {

      if (params.email.length > 30) {

        throw new Error("e-mail must be under 60 characters");

      }

      console.log('passed on_validate hook');

    },
    on_post_validate: async function (params) {

      assert(params.some_key, "params should have a new value set from pre_validate hook");

      console.log('passed on_pre_validate hook');

      // remove it if you want
      delete params.some_key;

    },
    on_pre_query: async function (params) {

      assert(!params.some_key, "some_key should be removed from on_post_validate hook");

      console.log('passed on_post_validate hook');

      // you can transform params by reference
      params.email = params.email.toLowerCase();

    },
    on_query: async function (params) {

      const email = params.email || null;

      assert(email[0] == 't', 'email should be transformed lowercase by pre_query hook');

      console.log('passed on_pre_query hook');

      // don't forget to return results
      return users_data[email];

    },
  }
});


(async function test_read () {

  // uppercase query is transformed by on_pre_query callback
  const test2 = await user_controller.read({email : "TEST2@gmail.com"});

  const tester = await user_controller.read({
      email : "TEST21312312412412411513513535131231@gmail.com"
  })
  .catch(function (err) {

    assert(err.constructor === Error, "query should throw error. email too long");

  });

  assert(test2.favorite_color == 'blue', 'result should be returned from controller action');

  console.log('action returns the result as expected');

  console.log('all tests passed');

})();
