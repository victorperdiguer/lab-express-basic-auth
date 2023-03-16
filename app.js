// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require('dotenv/config');

// ℹ️ Connects to the database
require('./db');

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const path = require('path');

// Handles the handlebars
// https://www.npmjs.com/package/hbs
const hbs = require('hbs');

const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most middlewares
require('./config')(app);

// default value for title local
const projectName = 'lab-express-basic-auth';
const capitalized = string => string[0].toUpperCase() + string.slice(1).toLowerCase();

app.locals.title = `${capitalized(projectName)}- Generated with Ironlauncher`;

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// For deployment
app.set('trust proxy', 1);
app.use(
  session({
    name: 'auth-lab',
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    cookie: {
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 2592000000 // 30 days in milliseconds
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL
    })
  })
)


// 👇 Start handling routes here
const index = require('./routes/index');
const authRouter = require('./routes/auth');
const mainRouter = require('./routes/main');
const privateRouter = require('./routes/private');

app.use('/', index);
app.use('/auth', authRouter);
app.use('/main', mainRouter);
app.use('/private', privateRouter);

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require('./error-handling')(app);

module.exports = app;

