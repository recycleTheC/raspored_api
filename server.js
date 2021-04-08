const express = require('express');
const cron = require('node-cron');
const connectDB = require('./config/db');

const dotenv = require('dotenv');
dotenv.config();

const app = express();
const mail = require('./mail');

// Connect Database
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));

app.use(function (req, res, next) {
	// Website you wish to allow to connect
	res.setHeader('Access-Control-Allow-Origin', process.env.CORS_VALUE);

	// Request methods you wish to allow
	res.setHeader(
		'Access-Control-Allow-Methods',
		'GET, POST, OPTIONS, PUT, PATCH, DELETE'
	);

	// Request headers you wish to allow
	res.setHeader(
		'Access-Control-Allow-Headers',
		'X-Requested-With,content-type,x-auth-token'
	);
	next();
});

app.disable('x-powered-by');

// Define Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/schedule', require('./routes/schedule'));
app.use('/api/teacher', require('./routes/teacher'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/class', require('./routes/classes'));
app.use('/api/exam', require('./routes/exams'));
app.use('/api/changes', require('./routes/changes'));
app.use('/api/breaks', require('./routes/breaks'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/subscribers', require('./routes/subscribers'));

cron.schedule(
	'00 12 * * sat',
	async () => {
		try {
			const update = await mail.weeklyUpdate();
		} catch (error) {
			console.error('Error sending emails', error);
		}
	},
	{
		timezone: 'Europe/Zagreb',
	}
);

cron.schedule(
	'00 15 * * sun-frid',
	async () => {
		try {
			const update = await mail.changesUpdate();
			console.log(update);
		} catch (error) {
			console.error('Error sending emails', error);
		}
	},
	{
		timezone: 'Europe/Zagreb',
	}
);

cron.schedule(
	'00 15 * * mon-thu',
	async () => {
		try {
			const update = await mail.dailyExams();
			console.log(update);
		} catch (error) {
			console.error('Error sending emails', error);
		}
	},
	{
		timezone: 'Europe/Zagreb',
	}
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
