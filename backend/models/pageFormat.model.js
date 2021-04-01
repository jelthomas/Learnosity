const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const pageFormatSchema = new Schema({
     type: {
          type: String, 
          required: true, 
          enum: ['Multiple Choice', 'Fill in the Blank', 'Matching', 'Timer']
     },
     prompt: {
          type: String, 
          required: true
     },
     audio_file : {
          type: String
     },
     page_title : {
          type: String, 
          required: true, 
          minLength: 1
     }, 
     multiple_choices : {
          type: {
               answer: {
                    type: String, 
                    minLength: 1, 
                    trim: true
               }
          }, 
          required:  function() {
               return this.type === "Multiple Choice";
     }},
     multiple_choice_answer: {
          type: String, 
          required:  function() {
          return this.type === "Multiple Choice";
     }},
     matching_pairs : {
          type: Map, 
          of: String, 
          required: function() {
          return this.type === "Matching"
     }},
     fill_in_the_blank_answers: {
          type: Map, 
          of: String, 
          required: function() {
          return this.type === "Fill in the Blank"
     }},
     clock: {
          type: Number, 
          min: 1, 
          max: 600,
          required: function() {
          return this.type === "Timer";
     }},
     timer_answers: { 
          type: {
               answer: { 
                    type: String,
                    minLength: 1, 
                    trim: true
                    } 
               }, 
               required: function() {
               return this.type === "Timer";
     }}
},
     {
          timestamps: true
});

const pageFormat = mongoose.model('pageFormat', pageFormatSchema);

module.exports = pageFormat;