'use strict';

const expect = require('chai').expect;
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const mongoose = require('mongoose');

const bookSchema = require('../schema/Schema.js');

mongoose.connect(process.env.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const BookModel = mongoose.model('BookModel', bookSchema);
console.log(mongoose.connection.readyState);

module.exports = function(app) {
    app.route('/api/books')
        .get(function(req, res) {
            //response will be array of book objects
            //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
            BookModel.find().exec((err, data) => {
                let books = data.map(({ _id, title, comments }) => ({
                    _id,
                    title,
                    commentcount: comments.length,
                }));
                res.json(books);
            });
        })

        .post(function(req, res) {
            const title = req.body.title;
            //response will contain new book object including atleast _id and title
            BookModel.findOne({ title }, (err, data) => {
                if (data === null) {
                    let book = new BookModel({
                        title,
                    });
                    book.save((err, book) => {
                        res.json(book);
                        res.end();
                    });
                }
            });
        })

        .delete(function(req, res) {
            //if successful response will be 'complete delete successful'
            BookModel.deleteMany().exec((err, data) => {
                if (err) {
                    res.end('no books in database.');
                }
                res.end('complete delete successful');
            });
        });

    app.route('/api/books/:id')
        .get(function(req, res) {
            const bookid = req.params.id;
            //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
            BookModel.findById(bookid, (err, data) => {
                res.json(data);
            });
        })

        .post(function(req, res) {
            const bookid = req.params.id;
            const { comment: comments } = req.body;
            //json res format same as .get
            BookModel.findByIdAndUpdate(
                bookid,
                { $push: { comments } },
                (err, data) => {
                    res.json(data);
                }
            );
        })

        .delete(function(req, res) {
            const bookid = req.params.id;
            //if successful response will be 'delete successful'
            BookModel.findByIdAndDelete(bookid).exec((err, data) => {
                if (err) {
                    res.end('no book exists.');
                    return;
                }
                res.end('delete successful.');
            });
        });
};
