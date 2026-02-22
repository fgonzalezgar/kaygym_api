const express = require('express');
const router = express.Router();
const gymController = require('../controllers/gymController');
const verifyToken = require('../middlewares/authMiddleware');

router.get('/:user_id', verifyToken, gymController.getGym);
router.put('/:user_id', verifyToken, gymController.updateGym);

module.exports = router;
