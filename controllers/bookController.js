const async = require('async');

// Models
const Book = require('../models/book');
const BookInstance = require('../models/book-instance.js');
const Author = require('../models/author');
const Genre = require('../models/genre');

const renderError = (err, message, res) => {
    return res.status(404).render('error', {
        title: 'Error',
        message,
        err,
    });
};

// Display home page
exports.index = (req, res) => {
    async.parallel(
        {
            bookCount: (callback) => Book.countDocuments({}, callback),
            bookInstanceCount: (callback) =>
                BookInstance.countDocuments({}, callback),
            bookInstanceAvailable: (callback) =>
                BookInstance.countDocuments({ status: 'Available' }, callback),
            authorCount: (callback) => Author.countDocuments({}, callback),
            genreCount: (callback) => Genre.countDocuments({}, callback),
        },
        (err, results) => {
            if (err) {
                return renderError(err, 'Not found', res);
            }

            return res.render('index', {
                title: 'Local Library',
                data: results,
            });
        }
    );
};

// Display list of all books.
exports.book_list = (req, res) => {
    Book.find({}, 'title author')
        .populate('author')
        .exec((err, bookList) => {
            if (err) {
                return renderError(err, 'All books error', res);
            }

            if (!bookList) {
                const err = new Error('No books');
                err.status = 404;
                return renderError(null, 'No books', res);
            }

            const sortedBookList = bookList.sort((book, nextBook) => {
                const bookTitle = book.title.toUpperCase();
                const nextBookTitle = nextBook.title.toUpperCase();

                if (bookTitle < nextBookTitle) {
                    return -1;
                } else if (bookTitle > nextBookTitle) {
                    return 1;
                }

                return 0;
            });

            res.render('bookList', {
                title: 'Book List',
                bookList: sortedBookList,
            });
        });
};

// Display detail page for a specific book.
exports.book_detail = (req, res) => {
    const { id } = req.params;

    async.parallel(
        {
            book: (callback) =>
                Book.findById(id)
                    .populate('author')
                    .populate('genre')
                    .exec(callback),
            bookInstanceList: (callback) =>
                BookInstance.find({ book: id }).exec(callback),
        },
        (error, { book, bookInstanceList }) => {
            if (error) {
                return renderError(error, 'Book Detail Error', res);
            }

            if (book === null) {
                error.status = 404;
                return renderError(error, 'No book', res);
            }

            return res.render('book', {
                title: `Book: ${book.title}`,
                book,
                bookInstanceList,
            });
        }
    );
};

// Display book create form on GET.
exports.book_create_get = (req, res) =>
    res.send('NOT IMPLEMENTED: book create get');

// Handle book create on POST.
exports.book_create_post = (req, res) =>
    res.send('NOT IMPLEMENTED: book create post');

// Display book delete form on GET.
exports.book_delete_get = (req, res) =>
    res.send('NOT IMPLEMENTED: book delete get');

// Handle book delete on POST.
exports.book_delete_post = (req, res) =>
    res.send('NOT IMPLEMENTED: book delete post');

// Display book update form on GET.
exports.book_update_get = (req, res) =>
    res.send('NOT IMPLEMENTED: book update get');

// Handle book update on POST.
exports.book_update_post = (req, res) =>
    res.send('NOT IMPLEMENTED: book update post');
