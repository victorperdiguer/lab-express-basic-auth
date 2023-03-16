const router = require("express").Router();
const isLoggedIn = require('../middlewares');

router.get('/', isLoggedIn, (req, res, next) => {
    const user = req.session.currentUser;
    res.render('private', {user});
})

module.exports = router;