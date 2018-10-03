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
    http_options: { 
      url: "/users/0",
    },
    passes: true
  },
  {
    test_case: "valid_get_1",
    http_options: { 
      url: "/users/1",
    },
    passes: true
  },
  {
    test_case: "valid_get_2",
    http_options: { 
      url: "/users/2",
    },
    passes: true,
  },
  {
    test_case: "valid_get_3",
    http_options: { 
      url: "/users/3",
    },
    passes: true
  },
  {
    test_case: "invalid_get_0",
    passes: false,
    http_options: { 
      url: "/users/foo",
    },
  },
  {
    test_case: "body_data_0",
    http_options: {
      url: "/user",
      data: {email: "test4@gmail.com", username: "test4"},
      method: "post"
    },
    passes: true
  }
];

module.exports = fixtures;
