//---- Packages ----//

const express = require('express');
const router = express.Router();
const sauceCtrl = require('../controllers/sauces');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

//---- Logique de routing ----//

router.post('/',auth, multer, sauceCtrl.createSauce);
router.post('/:id/like', auth, sauceCtrl.postLikeSauce);
router.put('/:id',auth, multer, sauceCtrl.modifySauce);
router.delete('/:id',auth , sauceCtrl.deleteSauce);
router.get('/:id', auth, sauceCtrl.getOneSauce);
router.get('/', auth, sauceCtrl.getAllSauces);

module.exports = router;