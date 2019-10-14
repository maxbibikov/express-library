const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GenreSchema = new Schema({
    name: { type: String, required: true, maxlength: 100, minlength: 3 },
});

// Virtual for Genre url
GenreSchema.virtual('url').get(function() {
    return `/catalog/genre/${this._id}`;
});

module.exports = mongoose.model('Genre', GenreSchema);
