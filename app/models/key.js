var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var keySchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    key: { type: String, required: true },
});

module.exports = mongoose.model('Key', keySchema);
