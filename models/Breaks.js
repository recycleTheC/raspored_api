const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var BreaksSchema = Schema({
	validFrom: {
		type: Date,
		required: true,
	},
	validUntil: {
		type: Date,
		required: true,
	},
	status: {
		type: String,
		required: true,
	},
	options: {
		type: String,
	},
});

module.exports = mongoose.model('breaks', BreaksSchema);
