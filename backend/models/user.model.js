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
        match: /^[\w|\.]+@\w+\.\w+$/, 
        required: true, 
        unique: true
    },
    security_question: { 
        type: String, 
        required: true
    },
    security_answer: {
        type: String,
        required: true
    },
    is_admin: {
        type: Boolean,
        default: false
    },
    created_platforms: [{type: mongoose.Schema.Types.ObjectId}],
    learned_platforms: [{type: mongoose.Schema.Types.ObjectId}],
    profile_picture: {
        type: String,
        default:""
    },
    total_time_played: {
        type: Number, 
        required: true, 
        default: 0
    },
   completed_platforms: {
        type: Number, 
        required: true, 
        default: 0
    },
    experience_points: {
        type: Number, 
        require: true,
        default: 0
    }
}, {
    timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;