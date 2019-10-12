const express = require('express');
const router = express.Router();

// Controllers
const bookController = require('../controllers/bookController');
const authorController = require('../controllers/authorController');
const bookInstanceController = require('../controllers/bookInstanceController');
const genreController = require('../controllers/genreController');

// BOOK ROUTES
router.get('/', bookController.index); // Home Page
// Request for one book details
router.get('/book/:id', bookController.book_detail);
// Request for book list fetails
router.get('/books', bookController.book_list);
// Create book
router.get('/book', bookController.book_create_get);
router.post('/book', bookController.book_create_post);
// Delete book
router.get('/book/:id/delete', bookController.book_delete_get);
router.post('/book/:id/delete', bookController.book_delete_post);
// Update book
router.get('/book/:id/update', bookController.book_update_get);
router.post('/book/:id/update', bookController.book_update_post);

// AUTHOR ROUTES
// Request for one author details
router.get('/author/:id', authorController.author_detail);
// Request for author list fetails
router.get('/authors', authorController.author_list);
// Create author
router.get('/author', authorController.author_create_get);
router.post('/author', authorController.author_create_post);
// Delete author
router.get('/author/:id/delete', authorController.author_delete_get);
router.post('/author/:id/delete', authorController.author_delete_post);
// Update author
router.get('/author/:id/update', authorController.author_update_get);
router.post('/author/:id/update', authorController.author_update_post);

// GENRE ROUTES
// Request for one author details
router.get('/genre/:id', genreController.genre_detail);
// Request for genre list fetails
router.get('/genres', genreController.genre_list);
// Create genre
router.get('/genre', genreController.genre_create_get);
router.post('/genre', genreController.genre_create_post);
// Delete genre
router.get('/genre/:id/delete', genreController.genre_delete_get);
router.post('/genre/:id/delete', genreController.genre_delete_post);
// Update genre
router.get('/genre/:id/update', genreController.genre_update_get);
router.post('/genre/:id/update', genreController.genre_update_post);

// BOOK_INSTANCE ROUTES
router.get('/book-instance/:id', bookInstanceController.bookInstance_detail);
// Request for bookInstance list fetails
router.get('/book-instances', bookInstanceController.bookInstance_list);
// Create bookInstance
router.get('/book-instance', bookInstanceController.bookInstance_create_get);
router.post('/book-instance', bookInstanceController.bookInstance_create_post);
// Delete book-instance
router.get(
    '/book-instance/:id/delete',
    bookInstanceController.bookInstance_delete_get
);
router.post(
    '/book-instance/:id/delete',
    bookInstanceController.bookInstance_delete_post
);
// Update book-instance
router.get(
    '/book-instance/:id/update',
    bookInstanceController.bookInstance_update_get
);
router.post(
    '/book-instance/:id/update',
    bookInstanceController.bookInstance_update_post
);

module.exports = router;
