const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubscriberSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	subscription: {
		type: [String],
	},
	accessKey: {
		type: String,
		required: true,
		unique: true,
	},
});

module.exports = mongoose.model('subscriber', SubscriberSchema);
