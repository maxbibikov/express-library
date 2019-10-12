const BookInstance = require('../models/book-instance.js');

// Display list of all bookInstances.
exports.bookInstance_list = (req, res) => res.send('NOT IMPLEMENTED: bookInstance list');

// Display detail page for a specific bookInstance.
exports.bookInstance_detail = (req, res) =>
    res.send(`NOT IMPLEMENTED: bookInstance detail: ${req.params.id}`);

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
