const moment = require('moment');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AuthorSchema = new Schema({
    first_name: { type: String, required: true, maxlength: 100 },
    family_name: { type: String, required: true, maxlength: 100 },
    date_of_birth: { type: Date },
    date_of_death: { type: Date },
});

// Virtual for author's full name
AuthorSchema.virtual('name').get(function() {
    return `${this.first_name} ${this.family_name}`;
});
// Virtual for author's lifespan
AuthorSchema.virtual('lifespan').get(function() {
    if (this.date_of_birth && this.date_of_death) {
        return this.date_of_death.getYear() - this.date_of_birth.getYear();
    } else if (this.date_of_birth) {
        const currentYear = moment().format('YYYY');
        return  currentYear - this.date_of_birth.getFullYear();
    }
    return null;
});
// Virtual for author's URL
AuthorSchema.virtual('url').get(function() {
    return `/catalog/author/${this._id}`;
});

// Virtual date of birth formatted
AuthorSchema.virtual('date_of_birth_formatted').get(function() {
    if (this.date_of_birth) {
        return moment(this.date_of_birth).format('YYYY');
    }

    return null;
});

// Virtual date of death formatted
AuthorSchema.virtual('date_of_death_formatted').get(function() {
    if (this.date_of_death) {
        return moment(this.date_of_death).format('YYYY');
    }
    return null;
});
module.exports = mongoose.model('Author', AuthorSchema);
