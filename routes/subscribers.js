const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Subscriber = require('../models/Subscriber');
const { v4: uuid, validate: validateUUID } = require('uuid');
const {
	subscriptionAdmin,
	subscriptionHello,
	subscriptionBye,
} = require('../mail/index');

// @route     POST api/subscribers
// @desc      Register a subscriber
// @access    Public

router.post(
	'/',
	[
		body('name').not().isEmpty().trim().escape(),
		body('email').isEmail(),
		body('subscription').isArray(),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { name, email, subscription } = req.body;

		try {
			let subscriber = await Subscriber.findOne({ email });

			if (subscriber) {
				return res.status(400).json({ msg: 'Pretplatnik već postoji!' });
			}

			subscriber = new Subscriber({
				name,
				email,
				subscription,
				accessKey: uuid(),
			});

			await subscriber.save();
			await subscriptionHello(email);

			return res.json({ msg: 'Pretplatnik uspješno prijavljen!' });
		} catch (error) {
			console.error(error.message);
			res.status(500).send('Server Error');
		}
	}
);

// @route     GET api/subscribers/:accessKey
// @desc      Get a subscriber
// @access    Public

router.get('/:accessKey', async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	const { accessKey } = req.params;

	try {
		if (!validateUUID(accessKey))
			return res.json({ msg: 'Pogrešan pristupni ključ!' });

		let subscriber = await Subscriber.findOne({ accessKey }).select(
			'-accessKey'
		);

		if (subscriber) return res.json(subscriber);
		else return res.status(400).json({ msg: 'Pretplatnik nije pronađen' });
	} catch (error) {
		console.error(error.message);
		res.status(500).send('Server Error');
	}
});

router.put(
	'/',
	[
		body('email').isEmail(),
		body('subscription').isArray(),
		body('accessKey').isUUID(),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { email, subscription, accessKey, name } = req.body;

		try {
			let subscriber = await Subscriber.findOne({ accessKey });

			if (!subscriber) {
				return res.status(400).json({ msg: 'Pretplatnik ne postoji!' });
			}

			const fields = {
				email,
				subscription,
				accessKey: uuid(),
			};

			if (name) fields.name = name;

			subscriber = await Subscriber.findOneAndUpdate({ accessKey }, fields, {
				new: true,
			});

			return res.json({ msg: 'Pretplata uspješno spremljena!' });
		} catch (error) {
			console.error(error.message);
			res.status(500).send('Server Error');
		}
	}
);

router.post('/request', [body('email').isEmail()], async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	const { email } = req.body;

	try {
		let subscriber = await Subscriber.findOne({ email });

		if (!subscriber) {
			return res.status(400).json({ msg: 'Pretplatnik ne postoji!' });
		}

		const sender = await subscriptionAdmin(email);

		if (sender) return res.json({ msg: 'E-mail poslan pretplatniku!' });
		else
			return res.json({
				msg: 'E-mail nije poslan pretplatniku! Obratiti se administratoru!',
			});
	} catch (error) {
		console.error(error.message);
		res.status(500).send('Server Error');
	}
});

router.put(
	'/',
	[
		body('email').isEmail(),
		body('subscription').isArray(),
		body('accessKey').isUUID(),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { email, subscription, accessKey, name } = req.body;

		try {
			let subscriber = await Subscriber.findOne({ accessKey });

			if (!subscriber) {
				return res.status(400).json({ msg: 'Pretplatnik ne postoji!' });
			}

			const fields = {
				email,
				subscription,
				accessKey: uuid(),
			};

			if (name) fields.name = name;

			subscriber = await Subscriber.findOneAndUpdate({ accessKey }, fields, {
				new: true,
			});

			return res.json({ msg: 'Pretplata uspješno spremljena!' });
		} catch (error) {
			console.error(error.message);
			res.status(500).send('Server Error');
		}
	}
);

router.delete('/', [body('accessKey').isUUID()], async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	const { accessKey } = req.body;

	try {
		let subscriber = await Subscriber.findOne({ accessKey });

		if (!subscriber) {
			return res.status(400).json({ msg: 'Pretplatnik ne postoji!' });
		}

		const sender = await subscriptionBye(subscriber.email);

		if (sender) {
			await subscriber.delete();
			return res.json({ msg: 'Pretplatnik odjavljen' });
		} else
			return res.json({
				msg: 'Pretplatnik nije odjavljen! Obratiti se administratoru!',
			});
	} catch (error) {
		console.error(error.message);
		res.status(500).send('Server Error');
	}
});

module.exports = router;
