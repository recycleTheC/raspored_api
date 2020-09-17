const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var ClassesScheme = Schema({
	name: {
		type: String,
		required: true,
	},
	teacher: {
		type: [Schema.Types.ObjectId],
		ref: 'teacher',
	},
	type: {
		type: String,
	},
});

module.exports = mongoose.model('classes', ClassesScheme);
