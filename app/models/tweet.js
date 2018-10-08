var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var autoIncrement = require('mongoose-auto-increment');
var Schema = mongoose.Schema;

autoIncrement.initialize(mongoose.connection);

var tweetSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  username: { type: String, required: true },
  property: {
    likes: [String]
  },
  retweeted: { type: Number, required: true, default: 0 },
  replies: { type: Number, required: true, default: 0 },
  content: { type: String, required: true },
  timestamp: { type: Number, required: true },
  childType: { type: String },
  parent: { type: Number },
  media: [String],
  profile: { type: String }
});

tweetSchema.plugin(uniqueValidator);
tweetSchema.plugin(autoIncrement.plugin, { model: 'Tweet', field: 'id' });
module.exports = mongoose.model('Tweet', tweetSchema);
