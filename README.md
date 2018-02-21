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
  resource_name: "todo",
  actions : {
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
        // query to mongo, postgres, whatever 
        return  todos[id] || null;

      }
    }
  }
});

// you could export your controller with module.exports, then
// use it in the index.js file using express within a route
// (or anything, really)

todo_controller.read({id: 2})
.then(function (result) {

  // {task: "do this secondly"}
  console.log(result);

})
.catch(function (err) {

  console.error(err);

});
```

## FAQ
### What if I don't want to use promises or async?
It will change your life

### How do I use data from <mongo, mysql, redis, couch>?
See examples in the code [example repository | https://github.com/thrakish/entity-controller-examples]

### How do I use with <express, happi, ...>? 
See examples in the code [example repository | https://github.com/thrakish/entity-controller-examples]
