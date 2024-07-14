const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

function getBooks() {
  return new Promise((resolve, reject) => {
    if (books) {
      setTimeout(() => { resolve(books) }, 300)
    } else {
      reject(new Error('Books not found'))
    }
  })
}

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  getBooks().then((books) => {
    res.send(JSON.stringify(books, null, 4));
  })
});

function getBookById(isbn) {
  return new Promise((resolve, reject) => {
    getBooks().then((bookList) => {
      const book = bookList[isbn];
      if (book) {
        resolve(book);
      } else {
        reject(new Error('Book not found'));
      }
    }).catch((err) => {
      res.status(404).send({ message: err.message });
    });
  })
}

function getBookByAuthor(author) {
  return new Promise((resolve, reject) => {
    getBooks().then((bookList) => {
      const index = Object.keys(bookList)
      index.forEach((item)=>{
        if (bookList[item].author === author) {
          resolve(bookList[item]);
        }
      })
      reject(new Error('Book not found'));
    }).catch((err) => {
      res.status(404).send({ message: err.message });
    });
  })
}

function getBookByTitle(title) {
  return new Promise((resolve, reject) => {
    getBooks().then((bookList) => {
      const index = Object.keys(bookList)
      index.forEach((item)=>{
        if (bookList[item].title === title) {
          resolve(bookList[item]);
        }
      })
      reject(new Error('Book not found'));
    }).catch((err) => {
      res.status(404).send({ message: err.message });
    });
  })
}
// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  getBookByTitle(title).then((book) => {
    res.status(200).send(JSON.stringify(book, null, 4));
  }).catch((err) => {
    res.status(404).send({ message: err.message });
  });
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  getBookByAuthor(author).then((book) => {
    res.status(200).send(JSON.stringify(book, null, 4));
  }).catch((err) => {
    res.status(404).send({ message: err.message });
  });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  getBookById(isbn).then((book) => {
    res.status(200).send(JSON.stringify(book, null, 4));
  }).catch((err) => {
    res.status(404).send({ message: err.message });
  });
});
 
public_users.post("/register", (req,res) => {
  const username = req.query.username;
  const password = req.query.password;
  
  if (username && password) {
    if (!isValid(username)) {
      users.push({ "username": username, "password": password });
      console.log( "User successfully registered. Now you can login")

      return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Username or Password are incorrect." });
});




//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if (!books[isbn]) {
    return res.status(404).send('Book not found');
  }
  res.send(books[isbn]);
});

module.exports.general = public_users;
