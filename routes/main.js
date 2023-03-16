const router = require("express").Router();
const isLoggedIn = require('../middlewares');

router.get('/', isLoggedIn, (req, res, next) =>  {
    const user = req.session.currentUser;
    res.render('main', {user});
})

module.exports = router;