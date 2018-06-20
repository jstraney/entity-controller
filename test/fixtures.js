const fixtures = {};

// test users
fixtures.users = [
  {
    email   : "test0@gmail.com",
    username: "test0",
    // conceptual genius 
    favorite_color: "black",
  },
  {
    email   : "test1@gmail.com",
    username: "test1",
    favorite_color: "red",
  },
  {
    email   : "test2@gmail.com",
    username: "test2",
    favorite_color: "blue",
  },
  {
    email   : "test3@gmail.com",
    username: "test3",
    favorite_color: "green",
  }
]

// test requests for 'handle_action' middleware
fixtures.test_requests = [
  {
    test_case: "valid_get_0",
    url: "/users/0",
    passes: true
  },
  {
    test_case: "valid_get_1",
    url: "/users/1",
    passes: true
  },
  {
    test_case: "valid_get_2",
    url: "/users/2",
    passes: true
  },
  {
    test_case: "valid_get_3",
    url: "/users/3",
    passes: true
  },
  {
    test_case: "invalid_get_0",
    url: "/users/foo",
    passes: false
  }
];

module.exports = fixtures;
