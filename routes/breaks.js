const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const { getWeek, format, parseISO } = require('date-fns');
const locale = require('date-fns/locale/hr');

const Breaks = require('../models/Breaks');

// @route    POST api/breaks/
// @desc     Create a break
// @access   Private

router.post(
	'/',
	[
		auth,
		[
			body('validFrom').notEmpty(),
			body('validUntil').notEmpty(),
			body('status').notEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { validFrom, validUntil, status, options } = req.body;

		try {
			const newBreak = new Breaks({
				validFrom,
				validUntil,
				status,
				options,
			});

			const breaks = await newBreak.save();

			res.json(breaks);
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server Error');
		}
	}
);

// @route    GET api/breaks/:date
// @desc     Check if date is during break time
// @access   Public

router.get('/:date', async (req, res) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	try {
		const date = new Date(req.params.date);

		let breaks = await Breaks.findOne({
			validFrom: {
				$lte: date,
			},
			validUntil: {
				$gte: date,
			},
		}).sort({ validUntil: 1 });

		if (!breaks)
			return res.json({
				msg: `Na ${format(date, 'dd.mm.yyyy.')} nisu praznici!`,
			});

		return res.send(breaks);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// @route    GET api/breaks/
// @desc     Get all breaks
// @access   Public

router.get('/', async (req, res) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	try {
		let breaks = await Breaks.find().sort({ validUntil: 1 });

		if (!breaks)
			return res.json({
				msg: `Nisu pronađeni praznici!`,
			});

		return res.send(breaks);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

module.exports = router;
