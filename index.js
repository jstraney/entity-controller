////// CONTROLLER //////
'use strict';

// contains instance of controller for each resource
const controllers = {};

// datasources used by controllers
controllers.data_sources = {};

// controllers actions 
controllers.actions = {};

//// Perform Action ////
const perform_action = async function (action_name, configs, params) {

  configs = configs || {};

  const resource_name = configs.resource_name;

  const controller    = controllers[resource_name];

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

//// Define Action ////
// assigns callback to the controllers actions 
function define_action (resource_name, action_name, configs) {

  configs.resource_name = resource_name;

  const controller = controllers[resource_name];

  controller.actions[action_name] = function (params) {

    // for logging purposes. maybe look at an environment
    // specific 'log_level' 
    // console.log("performing " + action_name, params);

    return perform_action(action_name, configs, params);

  };

  controllers[resource_name] = controllers[resource_name] || controller;

}

//// Configure ////
// allows configuration of the controllers three main
// configs {resource_name, actions, validator}
function configure (params) {

  const controller = {};

  params = params || {};

  const resource_name = params.resource_name || null; 

  controllers[resource_name] = controller;

  if (resource_name === null) {

    throw new Error("resource name is required on controller configuration");

    return;

  }

  controller.resource_name = resource_name;

  // no actions are required for a controller.
  const actions = params.actions || {}; 

  controller.actions = {};

  for (var action_name in actions) {

    var action_configs = actions[action_name];

    // console.log(resource_name, action_name, action_configs);

    define_action(resource_name, action_name, action_configs);

  }
  
  // console.log(controller);
  // the interface to the controller is its actions
  return controller.actions;

}

module.exports = configure
