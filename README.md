# Entity Controller
A simple and transparent controller with few dependencies, and much flexibility. Uses
async and promises internally, so if you do not like promises or async, do not use this
library.

```js
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
  // you can name your actions whatever you'd like. Do it CRUD,
  // or provide actions such as 'auth', 'login'
  read : {
    // other hooks include (in order):
    // on_pre_validate
    // on_validate
    // on_post_validate
    // on_pre_query
    // on_query
    // on_post_query
    // each one is treated async for you
    on_query : function (params) {

      const id = params.id;

      // get todo in our array. could replace with a
      // query to mongo, postgres, whatever. Be sure to
      // return the result
      return  todos[id] || null;

    }
  }
});

// you could export your controller with module.exports, then
// use it in the index.js file using express within a route
// (or anything, really)

// just using the action directly 
todo_controller.read({id: 2})
.then(function (result) {

  // {task: "do this secondly"}
  console.log(result);

})
.catch(function (err) {

  console.error(err);

});


// optionally (and this is my fav.) generating a middleware
// function for the action. 
app.use('/api/todo/:id', todo_controller.handle_action('read'));

// can add hooks to the 'handle_action' method to change
// response type (JSON by default)
app.use('todo/:id', todo_controller.handle_action('read', {
  on_result: async (req, res, todo) => {

    // render todo template with data
    res.render('todo/view.pug', {todo: todo});

  } 
  // other hooks include:
  //   on_post_result
  //   on_err 

}));

```

## FAQ
### What if I don't want to use promises or async?
Trust me, it will change your life! Try it till it sticks.

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

