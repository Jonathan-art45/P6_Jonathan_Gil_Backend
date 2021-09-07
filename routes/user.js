//---- Packages ----//

const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');

//---- Logiques de routes connexion/inscription ----//

router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;