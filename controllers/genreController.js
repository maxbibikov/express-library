const async = require('async');
const { body, validationResult, sanitizeBody } = require('express-validator');
const Genre = require('../models/genre');
const Book = require('../models/book');

const renderError = (message, error, res) => {
    return res.render('error', {
        message,
        error,
    });
};
// Display list of all genres.
exports.genre_list = (req, res) => {
    Genre.find()
        .sort([['name', 'ascending']])
        .exec((error, genreList) => {
            if (error) {
                return renderError('Genre List Error', error, res);
            }
            return res.render('genreList', { title: 'Genre List', genreList });
        });
};

// Display detail page for a specific genre.
exports.genre_detail = (req, res) => {
    const { id } = req.params;
    async.parallel(
        {
            genre: (callback) => Genre.findById(id).exec(callback),
            genreBooks: (callback) => Book.find({ genre: id }).exec(callback),
        },
        (error, results) => {
            if (error) {
                return renderError('Genre Error', error, res);
            }
            if (!results.genre) {
                const error = new Error('Not found');
                error.status = 404;
                return renderError('Genre Not Found', error, res);
            }

            return res.render('genre', {
                title: `Genre: ${results.genre.name}`,
                genre: results.genre,
                genreBooks: results.genreBooks,
            });
        }
    );
};
// Display genre create form on GET.
exports.genre_create_get = (req, res) => {
    return res.render('genreForm', { title: 'Create Genre' });
};

// Handle genre create on POST.
exports.genre_create_post = [
    // Validate that the name field is not empty
    body('name', 'Genre name required')
        .isLength({ min: 1 })
        .trim(),

    // Sanitize (escape) the name field
    sanitizeBody('name').escape(),

    // Request after validation and sanitization
    (req, res, next) => {
        // Extract validation error from a request
        const errors = validationResult(req);

        // Create a Genre object with escaped and trimmed data
        const newGenre = new Genre({ name: req.body.name });

        // If errors > render create genre form again with
        // sanitized values/error messages
        if (!errors.isEmpty()) {
            return res.render('genreForm', {
                title: 'Create Genre',
                newGenre,
                errors: errors.array(),
            });
        } else {
            // Entered data is valid
            // Check if genre with entered name already exists.
            Genre.findOne({ name: req.body.name }, (err, foundGenre) => {
                if (err) {
                    return next(err);
                }

                if (foundGenre) {
                    // Genre exist, redirect to its detail page.
                    return res.redirect(foundGenre.url);
                }

                return newGenre.save((err) => {
                    if (err) {
                        return next(err);
                    }
                    // New genre saved. Redirect to its detail page.
                    return res.redirect(newGenre.url);
                });
            });
        }
    },
];

// Display genre delete form on GET.
exports.genre_delete_get = (req, res, next) => {
    async.parallel(
        {
            genre: (callback) => Genre.findById(req.params.id).exec(callback),
            genreBooks: (callback) =>
                Book.find({ genre: req.params.id }).exec(callback),
        },
        (err, { genre, genreBooks }) => {
            if (err) {
                return next(err);
            }

            if (!genre) {
                return res.redirect('catalog/genres');
            }

            return res.render('genreDeleteForm', {
                title: 'Delete Genre',
                genre,
                genreBooks,
            });
        }
    );
};

// Handle genre delete on POST.
exports.genre_delete_post = [
    body('genreID')
        .trim()
        .isLength({ min: 1 }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(errors.array());
        }

        async.parallel(
            {
                genre: (callback) =>
                    Genre.findById(req.body.genreID).exec(callback),
                genreBooks: (callback) =>
                    Book.find({ genre: req.body.genreID }, 'title').exec(
                        callback
                    ),
            },
            (err, { genre, genreBooks }) => {
                if (err) {
                    return next(err);
                }

                if (genreBooks.length > 0) {
                    return res.render('genreDeleteForm', {
                        title: 'Delete Genre',
                        genre,
                        genreBooks,
                    });
                }

                return Genre.findByIdAndRemove(req.body.genreID).exec((err) => {
                    if (err) {
                        return next(err);
                    }

                    return res.redirect('/catalog/genres');
                });
            }
        );
    },
];

// Display genre update form on GET.
exports.genre_update_get = (req, res, next) => {
    return Genre.findById(req.params.id).exec((err, genre) => {
        if (err) {
            return next(err);
        }

        if (genre === null) {
            const error = new Error('Genre not found');
            error.status = 404;

            return next(error);
        }

        return res.render('genreForm', {
            title: 'Update Genre',
            genre,
        });
    });
};

// Handle genre update on POST.
exports.genre_update_post = [
    // Validate that the name field is not empty
    body('name', 'Genre name required')
        .isLength({ min: 1 })
        .trim(),

    // Sanitize (escape) the name field
    sanitizeBody('name').escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        const genre = new Genre({ name: req.body.name, _id: req.params.id });

        if (!errors.isEmpty()) {
            return res.render('genreForm', {
                title: 'Update Genre',
                genre,
                errors: errors.array(),
            });
        }

        return Genre.findByIdAndUpdate(genre._id, genre).exec(
            (err, updatedGenre) => {
                if (err) {
                    return next(err);
                }

                return res.redirect(updatedGenre.url);
            }
        );
    },
];
