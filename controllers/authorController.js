const async = require('async');
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
    res.send('NOT IMPLEMENTED: Author create get');

// Handle Author create on POST.
exports.author_create_post = (req, res) =>
    res.send('NOT IMPLEMENTED: Author create post');

// Display Author delete form on GET.
exports.author_delete_get = (req, res) =>
    res.send('NOT IMPLEMENTED: Author delete get');

// Handle Author delete on POST.
exports.author_delete_post = (req, res) =>
    res.send('NOT IMPLEMENTED: Author delete post');

// Display Author update form on GET.
exports.author_update_get = (req, res) =>
    res.send('NOT IMPLEMENTED: Author update get');

// Handle Author update on POST.
exports.author_update_post = (req, res) =>
    res.send('NOT IMPLEMENTED: Author update post');
