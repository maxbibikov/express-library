const Genre = require('../models/genre');

const genre = require('../models/genre');

// Display list of all genres.
exports.genre_list = (req, res) => {
    Genre.find()
        .sort([['name', 'ascending']])
        .exec((error, genreList) => {
            if (error) {
                return res.render('error', {
                    message: 'Genre List Error',
                    error,
                });
            }
            return res.render('genreList', { title: 'Genre List', genreList });
        });
};

// Display detail page for a specific genre.
exports.genre_detail = (req, res) =>
    res.send(`NOT IMPLEMENTED: genre detail: ${req.params.id}`);

// Display genre create form on GET.
exports.genre_create_get = (req, res) =>
    res.send('NOT IMPLEMENTED: genre create get');

// Handle genre create on POST.
exports.genre_create_post = (req, res) =>
    res.send('NOT IMPLEMENTED: genre create post');

// Display genre delete form on GET.
exports.genre_delete_get = (req, res) =>
    res.send('NOT IMPLEMENTED: genre delete get');

// Handle genre delete on POST.
exports.genre_delete_post = (req, res) =>
    res.send('NOT IMPLEMENTED: genre delete post');

// Display genre update form on GET.
exports.genre_update_get = (req, res) =>
    res.send('NOT IMPLEMENTED: genre update get');

// Handle genre update on POST.
exports.genre_update_post = (req, res) =>
    res.send('NOT IMPLEMENTED: genre update post');
