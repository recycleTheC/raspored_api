const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

const Notifications = require('../models/Notifications');

// @route    POST api/notifications
// @desc     Create a notification
// @access   Private

async function getNotifications(date) {
	let data = await Notifications.findOne({
		fromDate: {
			$lte: date,
		},
		toDate: {
			$gte: date,
		},
	});

	return data;
}

router.post(
	'/',
	[
		auth,
		[
			body('fromDate').not().isEmpty(),
			body('toDate').not().isEmpty(),
			body('title').not().isEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { fromDate, toDate, title, content } = req.body;

		try {
			const newNotification = new Notifications({
				fromDate,
				toDate,
				title,
				content,
			});

			const notification = await newNotification.save();

			if (notification) {
				const notifications = await Notifications.find();
				return res.json(notifications);
			} else return res.status(404).send();
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server Error');
		}
	}
);

// @route    GET api/notifications/:date
// @desc     Get notifications for day
// @access   Public

router.get('/day/:date', async (req, res) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	try {
		let notifications = await getNotifications(req.params.date);

		if (notifications) res.json(notifications);
		else return res.send({});
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// @route    GET api/notifications/all
// @desc     Get all notifications
// @access   Public

router.get('/all', async (req, res) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	try {
		let notifications = await Notifications.find();

		if (notifications) res.json(notifications);
		else return res.send({});
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// @route    GET api/notifications/id/:id
// @desc     Get all notifications
// @access   Public

router.get('/id/:id', async (req, res) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	try {
		let notifications = await Notifications.findOne({ _id: req.params.id });

		if (notifications) res.json(notifications);
		else return res.send({});
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// @route    DELETE api/notifications/:id
// @desc     Delete notification
// @access   Private

router.delete('/:id', auth, async (req, res) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	try {
		let notificationToDelete = await Notifications.findOne({
			_id: req.params.id,
		});

		if (!notificationToDelete)
			return res.json({ msg: 'Obavijest nije pronadjena' });

		const deleted = await Notifications.findOneAndDelete({
			_id: req.params.id,
		});

		return res.status(200).send();
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// @route    PUT api/notifications/:id
// @desc     Update notification
// @access   Private

router.put('/:id', auth, async (req, res) => {
	const { fromDate, toDate, title, content } = req.body;

	// Build contact object
	const updating = {};
	if (fromDate) updating.fromDate = fromDate;
	if (toDate) updating.toDate = toDate;
	if (content) updating.content = content;
	if (title) updating.title = title;

	try {
		let update = await Notifications.findById(req.params.id);

		if (!update) {
			return res.status(404).json({ msg: 'Obavijest nije pronađena' });
		}

		update = await Notifications.findByIdAndUpdate(req.params.id, updating, {
			new: true,
		});

		return res.json(update);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

module.exports = router;
