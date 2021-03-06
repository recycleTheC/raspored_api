const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

const Notes = require('../models/Notes');

async function getNotes(date) {
	const result = Notes.find({
		$or: [{ date: date }, { reminder: date }],
	});
	return result;
}

async function getReminders() {
	const result = Notes.find({ reminder: { $exists: true } }).populate({
		path: 'classKey',
		model: 'classes',
		select: 'name',
	});
	return result;
}

// @route    POST api/notes
// @desc     Create a note
// @access   Private

router.post(
	'/',
	[
		auth,
		[
			body('date').not().isEmpty(),
			body('note').not().isEmpty(),
			body('classId').not().isEmpty(),
			body('classKey').not().isEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { date, note, classId, classKey, reminder, title, hidden } = req.body;

		try {
			const newNote = new Notes({
				date,
				note,
				classId,
				classKey,
			});

			if (reminder) newNote.reminder = reminder;
			if (title) newNote.title = title;
			if (hidden) newNote.hidden = hidden;

			const _note = await newNote.save();

			if (_note) {
				let notes = await getNotes(date);

				if (!notes) return res.json({ msg: 'Biljeske nisu pronadjene' });

				res.json(notes); // Return all notes for simplicity
			}
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server Error');
		}
	}
);

// @route    GET api/notes/:date
// @desc     Get daily notes
// @access   Public

router.get('/date/:date', async (req, res) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	try {
		let notes = await getNotes(req.params.date);

		//if (!schedule) return res.status(404).json({ msg: "Schedule not found" });
		if (!notes) return res.json({ msg: 'Biljeske nisu pronadjene' });

		res.json(notes);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// @route    DELETE api/notes/:id
// @desc     Delete note
// @access   Private

router.delete('/:id', auth, async (req, res) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	try {
		let noteToDelete = await Notes.findOne({
			_id: req.params.id,
		});

		if (!noteToDelete) return res.json({ msg: 'Biljeska nije pronadjena' });

		const date = noteToDelete.date;

		const deleted = await Notes.findOneAndDelete({
			_id: req.params.id,
		});

		let notes = await getNotes(date);

		if (!notes) return res.json({ msg: 'Biljeske nisu pronadjene' });

		res.json(notes);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// @route    PUT api/notes/:id
// @desc     Update note
// @access   Private

router.put('/:id', auth, async (req, res) => {
	const { note, date, classKey, classId, title, reminder, hidden } = req.body;

	// Build contact object
	const noteFields = {};
	if (note) noteFields.note = note;
	if (date) noteFields.date = date;
	if (classKey) noteFields.classKey = classKey;
	if (classId) noteFields.classId = classId;
	if (title) noteFields.title = title;

	if (reminder) noteFields.reminder = reminder;
	else noteFields.reminder = null;

	if (hidden) noteFields.hidden = hidden;
	else noteFields.hidden = false;

	try {
		let update = await Notes.findById(req.params.id);

		if (!update) {
			return res.status(404).json({ msg: 'Bilješka nije pronađena' });
		}

		update = await Notes.findByIdAndUpdate(req.params.id, noteFields, {
			new: true,
		});

		let notes = await getNotes(update.date);

		if (!notes) return res.json({ msg: 'Bilješke nisu pronađene' });

		return res.json(notes);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// @route    GET api/notes/class/:id
// @desc     Get notes for one class
// @access   Public

router.get('/class/:id', async (req, res) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	try {
		let notes = await Notes.find({
			classKey: req.params.id,
		});

		if (!notes) return res.json({ msg: 'Biljeske nisu pronadjene' });

		res.json(notes);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// @route    GET api/notes/reminder
// @desc     Get all notes
// @access   Public

router.get('/reminders', async (req, res) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	try {
		let notes = await getReminders();

		if (!notes) return res.json({ msg: 'Biljeske nisu pronadjene' });

		res.json(notes);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

module.exports = router;
