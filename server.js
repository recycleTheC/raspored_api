const express = require('express');
const connectDB = require('./config/db');

const dotenv = require('dotenv');
dotenv.config();

const app = express();

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
