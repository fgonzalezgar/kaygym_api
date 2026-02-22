const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middlewares/authMiddleware');

router.post('/register-trial', authController.registerTrial);
router.post('/login', authController.login);
router.get('/trial-status/:email', verifyToken, authController.trialStatus);

module.exports = router;
