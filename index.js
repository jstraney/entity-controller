////// ENTITY CONTROLLER //////
'use strict';



//// Define Action ////

// assigns callback to the controllers actions 
function define_action (configs) {

  //// Perform Action ////
  return async function (params) {

    configs = configs || {};

    //// Callback Hooks ////
    // callback handlers for extra special handling. each handles
    // params by reference, besides the on_post_query hook which
    // modifies result set by return value.
    const on_pre_validate  = configs.on_pre_validate  || null;
    const on_validate      = configs.on_validate      || null; 
    const on_err           = configs.on_err           || null; 
    const on_post_validate = configs.on_post_validate || null;
    const on_pre_query     = configs.on_pre_query     || null;
    const on_query         = configs.on_query         || async function () { return {}; };
    const on_post_query    = configs.on_post_query    || null;

    params = params || {};

    //// Validation ////
    // use the pre_validate hook if it is set
    on_pre_validate && (await on_pre_validate(params));

    //// Validation ////
    if (on_validate && typeof on_validate === "function") {

      try {

        // if an error is thrown it is catched below
        on_validate(params);

      }
      catch (err) {

        // modify the error object
        on_err && (await on_err(err));

        // then returned as a rejected promise 
        return Promise.reject(err);

      }

    }

    // use the post_validate hook if it is set
    on_post_validate && (await on_post_validate(params));

    //// Query Preparation ////
    // use the pre_query hook if it is set
    on_pre_query && (await on_pre_query(params));

    // must always return a promise
    try {

      var result = await on_query(params);
      
      // alter results if callback is provided
      on_post_query && result.then(function (pre_result) {
        
        // call the post_query within promise. Do not forget
        // to return your altered result. 
        pre_result = on_post_query(params, pre_result);

        return pre_result;

      });

    }
    catch (err) {

      return Promise.reject(err);

    }

    // return promisified result
    return result;

  }

}

//// Configure ////
// @param {Object} actions 
function configure (actions) {

  const controller = {};

  // create the action callback for each action
  for (var action_name in actions) {

    const action_configs = actions[action_name];

    controller[action_name] = define_action(action_configs);

  }

  // method for controllers which produces middleware
  // that is pluggable into express 
  function handle_action(action, configs) {

    configs = configs || {};

    // allow hooks to be set for middleware 
    const on_result = configs.on_result || function (req, res, result) {

      res.json(result);

    };

    // handle error as json response
    const on_err = configs.on_err || function (req, res, err) {

      console.error(err);

      res.json(err);

    };

    if (controller[action]) {

      throw new Error(action + " is not an action defined for controller."); 

    }

    // return the middleware function that handles the action
    return async function (req, res, next) {

      var params = {};

      if (req.body && Object.keys(req.body).length) {

        params = Object.assign(params, req.body);

      }
      // sometimes params and queries get used together
      if (req.query && Object.keys(req.query).length) {

        params = Object.assign(params, req.query);

      }
      if (req.params && typeof req.params == "object") {

        params = Object.assign(params, req.params);

      }

      controller.actions[action](params)
      .then(function (result) {

        on_result(req, res, result);

      })
      .catch(function (err) {

        on_err(req, res, err);

      });

      // supposed to be an endpoint in terms of response, but may
      // pass on to middleware to upload files, cleanup something
      next();

    };

  }

  // append middleware generator to controller interface
  controller.handle_action = handle_action;

  return controller;

}

module.exports = configure;

