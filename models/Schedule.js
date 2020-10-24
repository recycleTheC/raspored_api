const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var ScheduleSchema = Schema({
	week: {
		type: String,
		required: true,
	},
	day: {
		type: String,
		required: true,
	},
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
	},
	classes: [
		{
			id: {
				type: Number,
				required: true,
			},
			class: {
				type: [Schema.Types.ObjectId],
				ref: 'classes',
			},
			timeStart: {
				type: String,
				required: true,
			},
			timeEnd: {
				type: String,
				required: true,
			},
			location: {
				type: String,
			},
		},
	],
});

module.exports = mongoose.model('schedule', ScheduleSchema);
