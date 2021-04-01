const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const platformDataSchema = new Schema({
  user_id: {type: mongoose.Schema.Types.ObjectId, required: true},
  platform_id: {type: mongoose.Schema.Types.ObjectId, required: true},
  completed_pages: [mongoose.Schema.Types.ObjectId],
  is_favorited: {type: Boolean, default: false},
  is_completed: {type:Boolean, default:false},
  recently_played: Date
}, {
  timestamps: true,
});

const platformData = mongoose.model('platformData', platformDataSchema);

module.exports = platformData;