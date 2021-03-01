'use strict';
const path = require('path');
const nodemailer = require('nodemailer');
const handlebars = require('nodemailer-express-handlebars');
const { addBusinessDays, format, getWeek } = require('date-fns');
const locale = require('date-fns/locale/hr');
const marked = require('marked');

const Notes = require('../models/Notes');
const Exams = require('../models/Exams');
const Changes = require('../models/Changes');
const Schedule = require('../models/Schedule');
const User = require('../models/User');

async function getNotes(from, to) {
	const result = await Notes.find({
		$and: [
			{
				reminder: {
					$gte: from,
				},
			},
			{
				reminder: {
					$lte: to,
				},
			},
		],
	})
		.populate({
			path: 'classKey',
			model: 'classes',
			select: 'name',
		})
		.sort({ reminder: 1 })
		.lean();

	return result;
}

async function getExams(from, to) {
	const result = await Exams.find({
		$and: [
			{
				date: {
					$gte: from,
				},
			},
			{
				date: {
					$lte: to,
				},
			},
		],
	})
		.populate({
			path: 'classKey',
			model: 'classes',
			select: 'name',
		})
		.sort({ date: 1 })
		.lean();

	return result;
}

async function getChanges(date) {
	const result = await Changes.find({
		date: date,
	})
		.populate({
			path: 'changed substitution',
			model: 'classes',
			select: 'name',
		})
		.sort({ classId: 1 })
		.lean();

	return result;
}

async function getSchedule(date) {
	const week = getWeek(date) % 2 === 0 ? 'parni' : 'neparni';
	const day = format(date, 'eeee', { locale, weekStartsOn: 2 });

	const result = await Schedule.findOne({
		week: week,
		day: day,
		validFrom: {
			$lte: date,
		},
		validUntil: {
			$gte: date,
		},
	})
		.sort({ validUntil: 1 })
		.populate({
			path: 'classes.class',
			model: 'classes',
			select: 'name type',
		})
		.lean();

	return result.classes;
}

let transporter = nodemailer.createTransport({
	host: 'localhost',
	port: 25,
	secure: false,
	tls: {
		rejectUnauthorized: false,
	},
});

transporter.use(
	'compile',
	handlebars({
		viewEngine: {
			name: 'express-handlebars',
			layoutsDir: path.join(__dirname, './views/layouts'),
			partialsDir: path.join(__dirname, './views/partials'),
			helpers: {
				markdown: function (opt) {
					return marked.parseInline(opt);
				},
				dateFromat: function (opt) {
					return format(opt, 'dd.MM. (eeee)', { locale });
				},
				eq: (v1, v2) => v1 === v2,
				neq: (v1, v2) => v1 !== v2,
			},
		},
		viewPath: path.join(__dirname, './views/'),
	})
);

exports.weeklyUpdate = async () => {
	const fromDate = addBusinessDays(new Date().setHours(0, 0, 0, 0), 1);
	const toDate = addBusinessDays(fromDate, 4);

	try {
		const notes = await getNotes(fromDate, toDate);
		const exams = await getExams(fromDate, toDate);

		const receivers = await User.find({
			subscription: 'weekly',
		})
			.select('email')
			.then((users) => users.map((user) => user.email));

		receivers.forEach(async (receiver) => {
			let info = await transporter.sendMail({
				from: 'Raspored <raspored@dev-mario.xyz>',
				to: receiver,
				subject: `Obaveze u tjednu ${format(fromDate, 'dd.MM.')} - ${format(
					toDate,
					'dd.MM.'
				)}`,
				template: 'obaveze',
				context: {
					time: new Date().toUTCString(),
					fromDate: format(fromDate, 'dd.MM.'),
					toDate: format(toDate, 'dd.MM.'),
					exams: exams,
					notes: notes,
				},
			});
			console.log(info.messageId);
		});

		return 'Weekly update sent sucessfully';
	} catch (error) {
		console.error(error);
	}
};

exports.changesUpdate = async () => {
	const date = addBusinessDays(new Date().setHours(0, 0, 0, 0), 1);

	try {
		const changes = await getChanges(date);
		const schedule = await getSchedule(date);

		if (changes.length < 1) return "No daily changes! Didn't send anything.";

		const receivers = await User.find({
			subscription: 'changes',
		})
			.select('email')
			.then((users) => users.map((user) => user.email));

		for (let i = 0; i < changes.length; i++) {
			if (!changes[i].substitution) {
				const regular = schedule.find((x) => x.id === changes[i].classId).class;

				const locations = changes[i].location.split(' / ');
				let strings = [];

				regular.forEach((item, n) => {
					strings.push(`${item.name} (${locations[n]})`);
				});

				changes[i].regular = strings.reduce((m, n) => `${m} / ${n}`);
			}
		}

		receivers.forEach(async (receiver) => {
			let info = await transporter.sendMail({
				from: 'Raspored <raspored@dev-mario.xyz>',
				to: receiver,
				subject: `Izmjene u rasporedu za ${format(date, 'dd.MM.yyyy.')}`,
				template: 'izmjene',
				context: {
					time: new Date().toUTCString(),
					date: format(date, 'dd.MM.yyyy. (eeee)', { locale }),
					changes: changes,
				},
			});
			console.log(info.messageId);
		});

		return 'Daily changes sent sucessfully';
	} catch (error) {
		console.error(error);
	}
};

exports.dailyExams = async () => {
	const date = addBusinessDays(new Date().setHours(0, 0, 0, 0), 1);

	try {
		const exams = await getExams(date, date);

		if (exams.length < 1) return "No daily exams! Didn't send anything...";

		const receivers = await User.find({
			subscription: 'exams',
		})
			.select('email')
			.then((users) => users.map((user) => user.email));

		receivers.forEach(async (receiver) => {
			let info = await transporter.sendMail({
				from: 'Raspored <raspored@dev-mario.xyz>',
				to: receiver,
				subject: `Ispiti ${format(date, 'dd.MM.yyyy')}`,
				template: 'ispiti',
				context: {
					time: new Date().toUTCString(),
					date: format(date, 'dd.MM.'),
					exams: exams,
				},
			});
			console.log(info.messageId);
		});

		return 'Daily exams sent sucessfully';
	} catch (error) {
		console.error(error);
	}
};
