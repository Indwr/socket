const mongoose = require('mongoose')

const Schema = mongoose.Schema

const commentSchema = new Schema({
    username: { type: String, required: true },
    comment: { type: String, require: true },
    user_id: {type:String},
}, { timestamps: true })

const Comment = mongoose.model('Comment', commentSchema)

module.exports = Comment