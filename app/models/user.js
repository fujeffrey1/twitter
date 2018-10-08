var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, required: true, default: false },
  followers: [String],
  following: [String],
  bio: { type: String },
  profile: { type: String }
});

userSchema.plugin(uniqueValidator);
module.exports = mongoose.model('User', userSchema);
