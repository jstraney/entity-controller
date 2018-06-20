# Entity Controller
A simple and transparent controller with few dependencies, and much flexibility. Uses
async and promises internally.

## End Result
```js
// somewhere in your route handling file

// ./controller uses entity-controller
const {handle_action} = require('./controller');

// simple controller middleware!
app.use('/api/todo/:id', handle_action('read'));

```

```js

// within controller.js
const controller = require('entity-controller');

// raw, object literal data, but you could require mongoose, mysql, or redis
// assume each arry index serves as the todo's id.
const todos = [ 
  {task: "first things first"},
  {task: "do this secondly"},
  {task: "nevermind do not bother."},
];

// simple example, assuming some 'todo list' app
const todo_controller = controller({
  read : {
    // see docs for other hooks
    on_query : function (params) {

      const id = params.id;

      if(todos[id]) return todos[id];

      else throw new Error('todo not found');

    }
  }
});

module.exports = todo_controller;

```

## Hooks
The entity controller itself uses hooks for different events which include:

* on_pre_validate
* on_validate
* on_post_validate
* on_pre_query
* on_query
* on_post_query
* on_result
* on_post_result
* on_err

This allows custom code at various points in the controller's lifecycle. But if you just want something that will write JSON, that is the default

Throwing an error within any of the hooks will cause the error to propogate to the response (JSON with 400 status)

The controller is granted a 'handle_action' middleware generator which also has its own hooks

* on_result
* on_post_result
* on_err


## FAQ
### What if I don't want to use promises or async?
Trust me, it will change your life! Try it till it sticks.

### How do I render a page with the results?
If you'd like to render a page with the results, try using your defined directly instead of handle_action 

### How do I use data from (mongo | mysql | redis | couch)?
It's as simple as adding those drivers as a dependency to your project. Requiring it outside the controller and using
the driver's methods inside the action declarations. All the mess of throwing errors is taken care of by the inner
working of the controller.

See examples in the code [example repository](https://github.com/thrakish/entity-controller-examples)

### How do I use with <express, happi, ...>? 
Currently express is the most tested and proven integration. As a courtesy, the controller has a middleware
function called 'handle_action' which follows the 'req, req' pattern. Otherwise, the controller can be used
directly and can exist independently of routing, or be used within any framework.

See examples in the code [example repository](https://github.com/thrakish/entity-controller-examples)

