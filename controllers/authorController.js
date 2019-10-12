const Author = require('../models/author');

// Display list of all Authors.
exports.author_list = (req, res) => res.send('NOT IMPLEMENTED: Author list');

// Display detail page for a specific Author.
exports.author_detail = (req, res) =>
    res.send(`NOT IMPLEMENTED: Author detail: ${req.params.id}`);

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
