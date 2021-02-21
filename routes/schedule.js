const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const { getWeek, format } = require('date-fns');
const locale = require('date-fns/locale/hr');

const Schedule = require('../models/Schedule');
const Breaks = require('../models/Breaks');

// @route    POST api/schedule
// @desc     Create a schedule
// @access   Private

router.post(
	'/',
	[
		auth,
		[
			body('day').isIn([
				'ponedjeljak',
				'utorak',
				'srijeda',
				'četvrtak',
				'petak',
				'subota',
				'nedjelja',
			]),
			body('week').isIn(['parni', 'neparni']),
			body('validFrom').notEmpty(),
			body('validUntil').notEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { day, week, classes, validFrom, validUntil, status } = req.body;

		try {
			const newSchedule = new Schedule({
				week,
				day,
				validFrom,
				validUntil,
				classes,
				status,
			});

			const schedule = await newSchedule.save();

			res.json(schedule);
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server Error');
		}
	}
);

// @route    GET api/schedule/:date
// @desc     Get daily schedule
// @access   Public

router.get('/:date', async (req, res) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	try {
		const date = new Date(req.params.date);
		const week = getWeek(date) % 2 === 0 ? 'parni' : 'neparni';
		const day = format(date, 'eeee', { locale, weekStartsOn: 2 });

		let schedule = await Schedule.findOne({
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
				populate: { path: 'teacher', model: 'teacher', select: 'name' },
			});

		let breaks = await Breaks.findOne({
			validFrom: {
				$lte: date,
			},
			validUntil: {
				$gte: date,
			},
		});

		if (!schedule && !breaks)
			return res.json({ msg: 'Raspored nije pronađen' });

		if (breaks) {
			const content = {
				classes: [],
				status: breaks.status,
				options: breaks.options,
			};
			return res.status(424).send(content);
		}

		return res.send(schedule.classes);
	} catch (err) {
		console.error(err.message);
		return res.status(500).send('Server error');
	}
});

module.exports = router;
