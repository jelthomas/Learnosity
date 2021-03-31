const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        minLength: 1,
        required: true,
        lowercase: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        minLength: 8,
        required: true
    },
    security_question: { 
        type: String, 
        required: true
    }
}, {
    timestamps: true,
});