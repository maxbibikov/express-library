const async = require('async');
const { body, sanitizeBody, validationResult } = require('express-validator');

// Model
const Author = require('../models/author');
const Book = require('../models/book');

// Display list of all Authors.
exports.author_list = (req, res) => {
    Author.find()
        .sort([['family_name', 'ascending']])
        .exec((error, authorList) => {
            if (error) {
                return res.render('error', {
                    message: 'Author List Error',
                    error,
                });
            }
            return res.render('authorList', {
                title: 'Author List',
                authorList,
            });
        });
};

// Display detail page for a specific Author.
exports.author_detail = (req, res) => {
    const { id } = req.params;

    async.parallel(
        {
            author: (callback) => Author.findById(id).exec(callback),
            authorBookList: (callback) =>
                Book.find({ author: id }, 'title summary').exec(callback),
        },
        (error, { author, authorBookList }) => {
            if (error) {
                return res.render('error', {
                    message: 'Author Detail Error',
                    error,
                });
            }
            if (!author) {
                const error = new Error('Author Not Found');
                error.status = 404;
                return res.render('error', {
                    message: 'Author Not Found',
                    error,
                });
            }

            return res.render('author', {
                title: `Author: ${author.name}`,
                author,
                authorBookList,
            });
        }
    );
};

// Display Author create form on GET.
exports.author_create_get = (req, res) =>
    res.render('authorForm', { title: 'Create Author' });

// Handle Author create on POST.
exports.author_create_post = [
    // Validate request parameters
    body('first_name')
        .isLength({ min: 1 })
        .trim()
        .withMessage('First name must be specified')
        .isAlphanumeric()
        .withMessage('First name has non-alphanumeric values'),
    body('family_name')
        .isLength({ min: 1 })
        .trim()
        .withMessage('Family name must be specified')
        .isAlphanumeric()
        .withMessage('Family name has non-alphanumeric values'),
    body('date_of_birth', 'Invalid date of birth')
        .optional({ checkFalsy: true })
        .isISO8601(),
    body('date_of_death', 'Invalid date of death')
        .optional({ checkFalsy: true })
        .isISO8601(),

    // Sanitize request parameters
    sanitizeBody('first_name').escape(),
    sanitizeBody('family_name').escape(),
    sanitizeBody('date_of_birth').toDate(),
    sanitizeBody('date_of_death').toDate(),

    (req, res, next) => {
        const errors = validationResult(req);
        console.log('errors: ', errors);
        if (!errors.isEmpty()) {
            return res.render('authorForm', {
                title: 'Create Author',
                author: req.body,
                errors: errors.array(),
            });
        }

        // Create Author object
        const newAuthor = new Author({
            first_name: req.body.first_name,
            family_name: req.body.family_name,
            date_of_birth: req.body.date_of_birth,
            date_of_death: req.body.date_of_death,
        });

        newAuthor.save((err) => {
            if (err) {
                return next(err);
            }

            return res.redirect(newAuthor.url);
        });
    },
];

// Display Author delete form on GET.
exports.author_delete_get = (req, res) => {
    async.parallel(
        {
            author: (callback) => Author.findById(req.params.id).exec(callback),
            authorBooks: (callback) =>
                Book.find({ author: req.params.id }).exec(callback),
        },
        (err, { author, authorBooks }) => {
            if (err) {
                return next(err);
            }

            if (!author) {
                return res.redirect('/catalog/authors');
            }

            return res.render('authorDeleteForm', {
                title: 'Delete Author',
                author,
                authorBooks,
            });
        }
    );
};

// Handle Author delete on POST.
exports.author_delete_post = [
    body('authorID')
        .trim()
        .isLength({ min: 1 }),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(errors.array());
        }

        async.parallel(
            {
                author: (callback) =>
                    Author.findById(req.body.authorID).exec(callback),
                authorBooks: (callback) =>
                    Book.find({ author: req.body.authorID }, 'title').exec(
                        callback
                    ),
            },
            (err, { author, authorBooks }) => {
                if (err) {
                    return next(err);
                }

                if (authorBooks.length > 0) {
                    return res.render('authorDeleteForm', {
                        title: 'Delete Author',
                        author,
                        authorBooks,
                    });
                }

                return Author.findByIdAndRemove(req.body.authorID).exec(
                    (err) => {
                        if (err) {
                            return next(err);
                        }

                        return res.redirect('/catalog/authors');
                    }
                );
            }
        );
    },
];

// Display Author update form on GET.
exports.author_update_get = (req, res, next) => {
    return Author.findById(req.params.id).exec((err, author) => {
        if (err) {
            return next(err);
        }

        return res.render('authorForm', {
            title: 'Update Author',
            author,
        });
    });
};

// Handle Author update on POST.
exports.author_update_post = [
    // Validate request parameters
    body('first_name')
        .isLength({ min: 1 })
        .trim()
        .withMessage('First name must be specified')
        .isAlphanumeric()
        .withMessage('First name has non-alphanumeric values'),
    body('family_name')
        .isLength({ min: 1 })
        .trim()
        .withMessage('Family name must be specified')
        .isAlphanumeric()
        .withMessage('Family name has non-alphanumeric values'),
    body('date_of_birth', 'Invalid date of birth')
        .optional({ checkFalsy: true })
        .isISO8601(),
    body('date_of_death', 'Invalid date of death')
        .optional({ checkFalsy: true })
        .isISO8601(),

    // Sanitize request parameters
    sanitizeBody('first_name').escape(),
    sanitizeBody('family_name').escape(),
    sanitizeBody('date_of_birth').toDate(),
    sanitizeBody('date_of_death').toDate(),
    (req, res, next) => {
        const errors = validationResult(req);
        const author = new Author({
            first_name: req.body.first_name,
            family_name: req.body.family_name,
            date_of_birth: req.body.date_of_birth,
            date_of_death: req.body.date_of_death,
            _id: req.params.id,
        });

        if (!errors.isEmpty()) {
            return res.render('authorForm', {
                title: 'Update Author',
                author,
                errors: errors.array(),
            });
        }

        return Author.findByIdAndUpdate(author._id, author).exec(
            (err, updatedAuthor) => {
                if (err) {
                    return next(err);
                }

                return res.redirect(updatedAuthor.url);
            }
        );
    },
];
