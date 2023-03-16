const router = require("express").Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const User = require('../models/User.model');

/* GET signup page */
/* ROUTE /auth/signup */
router.get("/signup", (req, res, next) => {
    const user = req.session.currentUser;
    res.render("auth/signup", user);
});

/* POST sign up Page */
router.post('/signup', async (req, res, next) => {
    let user = req.session.currentUser;
    const { username, password } = req.body;
    if (!username || !password) {
        res.render('auth/signup', { error: 'All fields are necessary', user});
        return;
    }
    const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    if (!regex.test(password)) {
        res.render('auth/signup', { error: 'Password needs to contain at least 6 characters, one number, one lowercase and one uppercase letter.', user });
        return;
    }
    try {
        const userInDB = await User.findOne({ username: username});
        if (userInDB) {
            res.render('auth/signup', { error: "There is already one user with this username", user});
            return;
        }
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await User.create({ username, hashedPassword});
        user = newUser;
        res.render('user/profile', {user});
    } catch (error) {
        next(error);
    }
});

/* GET login page */
router.get('/login', (req, res, next) => {
    const user = req.session.currentUser;
    res.render('auth/login', user);
});

/* POST for login without redirection */
router.post('/login/', async (req, res, next) => {
    let user = req.session.currentUser;
    const { username, password } = req.body;
    if (!username || !password) {
        res.render('auth/login', {error: 'All fields must be provided', user});
        return;
    }
    try {
        const userInDB = await User.findOne({ username: username});
        if (!userInDB) {
            res.render('auth/login', { error: `${username} does not exist`, user});
            return;
        }
        const passwordMatch = await bcrypt.compare(password, userInDB.hashedPassword);
        if (passwordMatch) {
            req.session.currentUser = userInDB;
            user = userInDB
            res.render('user/profile', {user});
        } else {
            res.render('auth/login', {error: 'Unable to authenticate', user})
        }
    } catch (error) {
        next(error);
    }
})

/* POST log in from redirection*/
router.post('/login/:originalUrl', async (req, res, next) => {
    const user = req.session.currentUser;
    const { username, password } = req.body;
    const { originalUrl } = req.params;
    console.log(originalUrl)
    if (!username || !password) {
        res.render('auth/login', {error: 'All fields must be provided', user});
        return;
    }
    try {
        const userInDB = await User.findOne({ username: username});
        if (!userInDB) {
            res.render('auth/login', { error: `${username} does not exist`, user});
            return;
        }
        const passwordMatch = await bcrypt.compare(password, userInDB.hashedPassword);
        if (passwordMatch) {
            req.session.currentUser = userInDB;
            if (originalUrl) {
                res.redirect('/' + originalUrl);
            }
        } else {
            res.render('auth/login', {error: 'Unable to authenticate', user})
        }
    } catch (error) {
        next(error);
    }
})

/* GET logout */
router.get('/logout', (req, res, next) => {
    req.session.destroy((err) => {
      if (err) {
        next(err)
      } else {
        res.clearCookie('show-app')
        res.redirect('/auth/login');
      }
    });
  });

module.exports = router;