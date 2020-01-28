const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: String,
    comments: {
        type: [String],
        default: [],
    },
});

module.exports = bookSchema;
