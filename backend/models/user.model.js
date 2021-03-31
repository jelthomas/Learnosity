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
    email: {
        type: String, 
        minLength: 5, 
        match: /^\w+@\w+\.\w+$/, 
        required: true, 
        unique: true
    },
    security_question: { 
        type: String, 
        required: true
    },
    security_answer: {
        
    },
    is_admin: {
        
    },
    total_time_played: {

    },
   completed_platforms: {
       
    }
}, {
    timestamps: true,
});