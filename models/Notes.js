const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotesSchema = new Schema({
	date: {
		type: Date,
		required: true,
		default: new Date(),
	},
	classId: {
		type: Number,
		required: true,
	},
	classKey: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: 'classes',
	},
	note: {
		type: String,
		required: true,
	},
	reminder: {
		type: Date,
	},
	title: {
		type: String,
	},
	hidden: {
		type: Boolean,
	},
});

module.exports = mongoose.model('notes', NotesSchema);
