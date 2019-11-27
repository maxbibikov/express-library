const async = require('async');
const { body, sanitizeBody, validationResult } = require('express-validator');

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

const sortBookList = (bookList) =>
    bookList.sort((book, nextBook) => {
        const bookTitle = book.title.toUpperCase();
        const nextBookTitle = nextBook.title.toUpperCase();

        if (bookTitle < nextBookTitle) {
            return -1;
        } else if (bookTitle > nextBookTitle) {
            return 1;
        }

        return 0;
    });
exports.sortBookList = sortBookList;
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
            const sortedBookList = sortBookList(bookList);

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
exports.book_create_get = (req, res) => {
    // Get all authors and genres, which we can use for adding to our book.
    async.parallel(
        {
            authorList: (callback) => Author.find(callback),
            genreList: (callback) => Genre.find(callback),
        },
        (err, { authorList, genreList }) => {
            if (err) {
                return next(err);
            }

            return res.render('bookForm', {
                title: 'Create Book',
                authorList,
                genreList,
            });
        }
    );
};

// Handle book create on POST.
exports.book_create_post = [
    // Validate params
    body('title')
        .isLength({ min: 1 })
        .trim()
        .withMessage('Book title is required'),
    body('author')
        .isLength({ min: 1 })
        .trim()
        .withMessage('Book author is required'),
    body('summary')
        .isLength({ min: 20 })
        .trim()
        .withMessage('Book summary is too short'),
    body('isbn')
        .isLength({ min: 1 })
        .trim()
        .withMessage('Book isbn is required'),

    // Sanitize params (using wildcard)
    sanitizeBody('title').escape(),
    sanitizeBody('author').escape(),
    sanitizeBody('summary').escape(),
    sanitizeBody('isbn').escape(),
    sanitizeBody('genre.*').escape(),

    // Convert genre to an array
    (req, res, next) => {
        const { genre } = req.body;

        if (!Array.isArray(genre)) {
            if (!genre) {
                req.body.genre = [];
            } else {
                req.body.genre = new Array(genre);
            }
        }
        next();
    },

    // Proceed request after validation and sanitization
    (req, res, next) => {
        const errors = validationResult(req);
        const { title, author, summary, isbn, genre } = req.body;

        // Create new book object
        const newBook = new Book({
            title,
            author,
            summary,
            isbn,
            genre,
        });

        if (!errors.isEmpty()) {
            // Get all authors and genres for book form
            async.parallel(
                {
                    authorList: (callback) => Author.find(callback),
                    genreList: (callback) => Genre.find(callback),
                },
                (err, { authorList, genreList }) => {
                    if (err) {
                        return next(err);
                    }
                    // To show checked genres.
                    for (let i = 0; i < genreList.length; i += 1) {
                        if (newBook.genre.indexOf(genreList[i]._id) > -1) {
                            genreList[i].checked = 'true';
                        }
                    }

                    return res.render('bookForm', {
                        title: 'Create Book',
                        authorList,
                        genreList,
                        book: newBook,
                        errors: errors.array(),
                    });
                }
            );
        } else {
            newBook.save((err) => {
                if (err) {
                    return next(err);
                }

                return res.redirect(newBook.url);
            });
        }
    },
];

// Display book delete form on GET.
exports.book_delete_get = (req, res, next) => {
    async.parallel(
        {
            book: (callback) => Book.findById(req.params.id).exec(callback),
            bookInstanceList: (callback) =>
                BookInstance.find({ book: req.params.id }).exec(callback),
        },
        (err, { book, bookInstanceList }) => {
            if (err) {
                return next(err);
            }

            if (!book) {
                return res.redirect('/catalog/books');
            }

            return res.render('bookDeleteForm', {
                title: 'Delete Book',
                book,
                bookInstanceList,
            });
        }
    );
};

// Handle book delete on POST.
exports.book_delete_post = [
    body('bookID')
        .trim()
        .isLength({ min: 1 }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(errors.array());
        }
        async.parallel(
            {
                book: (callback) => Book.findById(req.params.id).exec(callback),
                bookInstanceList: (callback) =>
                    BookInstance.find({ book: req.params.id }).exec(callback),
            },
            (err, { book, bookInstanceList }) => {
                if (err) {
                    return next(err);
                }

                if (bookInstanceList.length > 0) {
                    return res.render('bookDeleteForm', {
                        title: 'Delete Book',
                        book,
                        bookInstanceList,
                    });
                }

                return Book.findByIdAndRemove(req.body.bookID).exec((err) => {
                    if (err) {
                        return next(err);
                    }

                    return res.redirect('/catalog/books');
                });
            }
        );
    },
];

// Display book update form on GET.
exports.book_update_get = (req, res, next) => {
    // get book, authors and genres
    async.parallel(
        {
            book: (callback) =>
                Book.findById(req.params.id)
                    .populate('author')
                    .populate('genre')
                    .exec(callback),
            authorList: (callback) => Author.find(callback),
            genreList: (callback) => Genre.find(callback),
        },
        (err, { book, authorList, genreList }) => {
            if (err) {
                return next(err);
            }

            if (book === null) {
                const error = new Error('Book not found');

                error.status = 404;
                return next(error);
            }

            // mark our selected genres as selected
            const currentBookGenreList = book.genre;
            const genreListWithSelected = genreList.map((genre) => {
                const isGenreSelected = currentBookGenreList.find(
                    (bookGenre) =>
                        genre._id.toString() === bookGenre._id.toString()
                );
                if (isGenreSelected) {
                    return Object.assign(genre._doc, { checked: true });
                }

                return genre;
            });

            return res.render('bookForm', {
                title: 'Update Book',
                book,
                authorList,
                genreList: genreListWithSelected,
            });
        }
    );
};

// Handle book update on POST.
exports.book_update_post = [
    // Validate params
    body('title')
        .isLength({ min: 1 })
        .trim()
        .withMessage('Book title is required'),
    body('author')
        .isLength({ min: 1 })
        .trim()
        .withMessage('Book author is required'),
    body('summary')
        .isLength({ min: 20 })
        .trim()
        .withMessage('Book summary is too short'),
    body('isbn')
        .isLength({ min: 1 })
        .trim()
        .withMessage('Book isbn is required'),

    // Sanitize params
    sanitizeBody('title').escape(),
    sanitizeBody('author').escape(),
    sanitizeBody('summary').escape(),
    sanitizeBody('isbn').escape(),
    sanitizeBody('genre.*').escape(),

    // Convert genre to an array
    (req, res, next) => {
        const { genre } = req.body;

        if (!Array.isArray(genre)) {
            if (!genre) {
                req.body.genre = [];
            } else {
                req.body.genre = new Array(genre);
            }
        }
        next();
    },

    // Proceed request after validation and sanitization
    (req, res, next) => {
        const errors = validationResult(req);

        // Create a book object with escaped/trimmed data and old ID
        const book = new Book({
            title: req.body.title,
            author: req.body.title,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: req.body.genre,
            _id: req.params.id,
        });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values and error messages.

            // Get book authors and genres for form
            return async.parallel(
                {
                    authorList: (callback) => Author.find(callback),
                    genreList: (callback) => Genre.findById(callback),
                },
                (err, { authorList, genreList }) => {
                    if (err) {
                        return next(err);
                    }

                    const genreListWithSelected = genreList.map((genre) => {
                        if (book.genre.indexOf(genre._id) > -1) {
                            return Object.assign(genre._doc, { checked: true });
                        }
                        return genre;
                    });

                    return res.render('bookForm', {
                        title: 'Update Book',
                        book,
                        authorList,
                        genreList: genreListWithSelected,
                        errors: errors.array(),
                    });
                }
            );
        } else {
            // Update book data
            Book.findByIdAndUpdate(req.params.id, book, (err, updatedBook) => {
                if (err) {
                    return next(err);
                }

                return res.redirect(updatedBook.url);
            });
        }
    },
];
