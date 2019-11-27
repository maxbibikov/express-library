const async = require('async');
const { body, sanitizeBody, validationResult } = require('express-validator');
const BookInstance = require('../models/book-instance.js');
const Book = require('../models/book');
const { sortBookList } = require('../controllers/bookController');

// Display list of all bookInstances.
exports.bookInstance_list = (req, res) => {
    BookInstance.find({})
        .populate('book')
        .exec((error, bookInstanceList) => {
            if (error) {
                res.render('error', {
                    message: 'Book Instance List Error',
                    error,
                });
            }

            res.render('bookInstanceList', {
                title: 'Book Instance List',
                bookInstanceList,
            });
        });
};

// Display detail page for a specific bookInstance.
exports.bookInstance_detail = (req, res) => {
    const { id } = req.params;

    BookInstance.findById(id)
        .populate('book')
        .exec((err, bookInstance) => {
            if (err) {
                return next(err);
            }
            if (!bookInstance) {
                const error = new Error('Book Instance Not Found');
                error.status = 404;
                return next(error);
            }
            return res.render('bookInstance', {
                title: `${bookInstance._id}`,
                bookInstance,
            });
        });
};
// Display bookInstance create form on GET.
exports.bookInstance_create_get = (req, res) => {
    Book.find({}).exec((err, bookList) => {
        if (err) {
            return next(err);
        }

        const sortedBookList = sortBookList(bookList);

        return res.render('bookInstanceForm', {
            title: 'Create Book Instance',
            bookList: sortedBookList,
        });
    });
};

// Handle bookInstance create on POST.
exports.bookInstance_create_post = [
    // Validate fields
    body('book', 'Book must be specified')
        .isLength({ min: 1 })
        .trim(),
    body('imprint', 'Imprint must be specified')
        .isLength({ min: 1 })
        .trim(),
    body('due_back', 'Invalid date').toDate(),

    // Sanitize fields
    sanitizeBody('book').escape(),
    sanitizeBody('imprint').escape(),
    sanitizeBody('status')
        .trim()
        .escape(),
    sanitizeBody('due_back').toDate(),

    // Process request after validation and sanitization
    (req, res, next) => {
        const errors = validationResult(req);
        console.log('req.body.due_back: ', req.body.due_back);

        const bookInstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back,
        });

        if (!errors.isEmpty()) {
            return Book.find({}, 'title').exec((err, bookList) => {
                if (err) {
                    return next(err);
                }

                const sortedBookList = sortBookList(bookList);

                return res.render('bookInstanceForm', {
                    title: 'Create Book Instance',
                    bookList: sortedBookList,
                    book: bookInstance.book,
                    errors: errors.array(),
                    bookInstance,
                });
            });
        }

        return bookInstance.save((err) => {
            if (err) {
                return next(err);
            }

            // Redirect to new book instance page.
            return res.redirect(bookInstance.url);
        });
    },
];
// Display bookInstance delete form on GET.
exports.bookInstance_delete_get = (req, res) =>
    res.send('NOT IMPLEMENTED: bookInstance delete get');

// Handle bookInstance delete on POST.
exports.bookInstance_delete_post = [
    body('bookInstanceID')
        .trim()
        .isLength({ min: 1 }),

    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return next(errors.array());
        }

        return BookInstance.findByIdAndRemove(req.body.bookInstanceID).exec(
            (err) => {
                if (err) {
                    return next(err);
                }

                return res.redirect('/catalog/book-instances');
            }
        );
    },
];

// Display bookInstance update form on GET.
exports.bookInstance_update_get = (req, res, next) => {
    return async.parallel(
        {
            bookInstance: (callback) =>
                BookInstance.findById(req.params.id)
                    .populate('book')
                    .exec(callback),
            bookList: (callback) => Book.find({}).exec(callback),
        },
        (err, { bookInstance, bookList }) => {
            console.log('bookList: ', bookList);
            if (err) {
                return next(err);
            }

            if (!bookInstance) {
                const error = new Error('Book Instance Not Found');
                error.status = 404;

                return next(error);
            }

            const sortedBookList = sortBookList(bookList);

            return res.render('bookInstanceForm', {
                title: 'Update Book Instance',
                bookInstance,
                bookList: sortedBookList,
            });
        }
    );
};

// Handle bookInstance update on POST.
exports.bookInstance_update_post = [
    // Validate fields
    body('book', 'Book must be specified')
        .isLength({ min: 1 })
        .trim(),
    body('imprint', 'Imprint must be specified')
        .isLength({ min: 1 })
        .trim(),
    body('due_back', 'Invalid date').toDate(),

    // Sanitize fields
    sanitizeBody('book').escape(),
    sanitizeBody('imprint').escape(),
    sanitizeBody('status')
        .trim()
        .escape(),
    sanitizeBody('due_back').toDate(),
    (req, res, next) => {
        const errors = validationResult(req);
        const bookInstance = new BookInstance({
            _id: req.params.id,
            book: req.body.book,
            imprint: req.body.imprint,
            due_back: req.body.due_back,
            status: req.body.status,
        });

        if (!errors.isEmpty()) {
            return res.render('bookInstanceForm', {
                title: 'Update Book Instance',
                bookInstance,
                errors: errors.array(),
            });
        }

        return BookInstance.findByIdAndUpdate(
            bookInstance._id,
            bookInstance
        ).exec((err, updatedBookInstance) => {
            if (err) {
                return next(err);
            }

            return res.redirect(updatedBookInstance.url);
        });
    },
];
