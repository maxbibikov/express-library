const BookInstance = require('../models/book-instance.js');
const Book = require('../models/book');

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
exports.bookInstance_create_get = (req, res) =>
    res.send('NOT IMPLEMENTED: bookInstance create get');

// Handle bookInstance create on POST.
exports.bookInstance_create_post = (req, res) =>
    res.send('NOT IMPLEMENTED: bookInstance create post');

// Display bookInstance delete form on GET.
exports.bookInstance_delete_get = (req, res) =>
    res.send('NOT IMPLEMENTED: bookInstance delete get');

// Handle bookInstance delete on POST.
exports.bookInstance_delete_post = (req, res) =>
    res.send('NOT IMPLEMENTED: bookInstance delete post');

// Display bookInstance update form on GET.
exports.bookInstance_update_get = (req, res) =>
    res.send('NOT IMPLEMENTED: bookInstance update get');

// Handle bookInstance update on POST.
exports.bookInstance_update_post = (req, res) =>
    res.send('NOT IMPLEMENTED: bookInstance update post');
