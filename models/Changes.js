const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChangesSchema = new Schema({
	date: {
		type: Date,
		required: true,
		default: new Date(),
	},
	classId: {
		type: Number,
		required: true,
	},
	changed: {
		type: Schema.Types.ObjectId,
		ref: 'classes',
	},
	substitution: {
		type: Schema.Types.ObjectId,
		ref: 'classes',
	},
	location: {
		type: String,
	},
	timeStart: {
		type: String,
	},
	timeEnd: {
		type: String,
	},
});

module.exports = mongoose.model('changes', ChangesSchema);
