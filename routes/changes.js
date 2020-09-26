const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

const Changes = require('../models/Changes');

// @route    POST api/changes
// @desc     Create a change in schedule
// @access   Private

router.post(
	'/',
	[auth, [body('date').not().isEmpty(), body('classId').not().isEmpty()]],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { date, classId, changed, substitution, location } = req.body;

		try {
			const newChange = new Changes({
				date,
				classId,
				changed,
				substitution,
				location,
			});

			const change = await newChange.save();

			if (change) {
				let changes = await Changes.find({
					date: date,
				}).populate({
					path: 'substitution',
					model: 'classes',
					select: 'name',
					populate: { path: 'teacher', model: 'teacher', select: 'name' },
				});

				if (!changes) return res.json({ msg: 'Izmjene nisu pronadjene' });

				res.json(changes); // Return all changes for simplicity
			}
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server Error');
		}
	}
);

// @route    GET api/changes/:date
// @desc     Get daily changes
// @access   Public

router.get('/:date', async (req, res) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	try {
		let changes = await Changes.find({
			date: req.params.date,
		}).populate({
			path: 'substitution',
			model: 'classes',
			select: 'name',
			populate: { path: 'teacher', model: 'teacher', select: 'name' },
		});

		if (!changes) return res.json({ msg: 'Izmjene nisu pronadjene' });

		res.json(changes);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// @route    DELETE api/changes/:id
// @desc     Delete change
// @access   Private

router.delete('/:id', auth, async (req, res) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	try {
		let changeToDelete = await Changes.findById(req.params.id);

		if (!changeToDelete) return res.json({ msg: 'Izmjena nije pronadjena' });

		const date = changeToDelete.date;

		const deleted = await Changes.findOneAndDelete({
			_id: req.params.id,
		});

		let changes = await Changes.find({
			date: date,
		}).populate({
			path: 'substitution',
			model: 'classes',
			select: 'name',
			populate: { path: 'teacher', model: 'teacher', select: 'name' },
		});

		if (!changes) return res.json({ msg: 'Izmjene nisu pronadjene' });

		res.json(changes);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// @route    PUT api/changes/:id
// @desc     Update change
// @access   Private

router.put('/:id', auth, async (req, res) => {
	const { classId, changed, substitution, location } = req.body;

	const fields = {};
	if (classId) fields.classId = classId;
	if (changed) fields.changed = changed;
	if (substitution) fields.substitution = substitution;
	if (location) fields.location = location;

	try {
		let update = await Changes.findById(req.params.id);

		if (!update) {
			return res.status(404).json({ msg: 'Izmjena nije pronađena' });
		}

		update = await Changes.findByIdAndUpdate(req.params.id, fields, {
			new: true,
		});

		let changes = await Changes.find({
			date: update.date,
		}).populate({
			path: 'substitution',
			model: 'classes',
			select: 'name',
			populate: { path: 'teacher', model: 'teacher', select: 'name' },
		});

		if (!changes) return res.json({ msg: 'Bilješke nisu pronađene' });

		return res.json(changes);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

module.exports = router;
