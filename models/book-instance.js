const moment = require('moment');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookInstanceSchema = new Schema({
    book: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    imprint: { type: String, required: true },
    status: {
        type: String,
        required: true,
        enum: ['Available', 'Maintenance', 'Loaned', 'Reserved'],
        default: 'Maintenance',
    },
    due_back: { type: Date, default: Date.now },
});

// Virtual for BookInstance url
BookInstanceSchema.virtual('url').get(function() {
    return `/catalog/book-instance/${this._id}`;
});

// Virtual for formatted due_date
BookInstanceSchema.virtual('due_back_formatted').get(function() {
    return moment(this.due_back).format('MMMM Do, YYYY');
});

// Virtual for due_date in format YYYY-MM-DD
BookInstanceSchema.virtual('due_back_YYYYMMDD').get(function() {
    return moment(this.due_back).format('YYYY-MM-DD');
});
module.exports = mongoose.model('BookInstance', BookInstanceSchema);
