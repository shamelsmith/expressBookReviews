const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  return userswithsamename.length > 0;
}

const authenticatedUser = (username,password)=>{ //returns boolean
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  return validusers.length > 0;
}


//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.query.username;
  const password = req.query.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken, username
    };
    console.log("User successfully logged in")

    return res.status(200).send({ message:"User successfully logged in" });
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.authorization.username;
  if (!books[isbn]) {
    return res.status(404).send({ message: 'Book not found' });
  }
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }
  console.log("Reviews before is "+JSON.stringify(books[isbn].reviews,null,4))
  books[isbn].reviews[username] = review;
  console.log("Reviews after is "+JSON.stringify(books[isbn].reviews,null,4))

  res.status(200).send({ message: 'Review added/updated successfully' });
});
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).send({ message: 'Book not found' });
  }
  if (books[isbn].reviews && books[isbn].reviews[username]) {
    console.log("Reviews before is "+JSON.stringify(books[isbn].reviews,null,4))
    delete books[isbn].reviews[username];
    console.log("Reviews after is "+JSON.stringify(books[isbn].reviews,null,4))
    return res.status(200).send({ message: 'Review deleted successfully' });
  } else {
    return res.status(404).send({ message: 'Review not found' });
  }

})
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
