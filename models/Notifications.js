const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationsSchema = new Schema({
	fromDate: {
		type: Date,
		required: true,
		default: new Date(),
	},
	toDate: {
		type: Date,
		required: true,
		default: new Date(),
	},
	title: {
		type: String,
		required: true,
	},
	content: {
		type: String,
	},
});

module.exports = mongoose.model('notifications', NotificationsSchema);
