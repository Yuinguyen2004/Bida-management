const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/session.controller');
const auth = require('../middleware/auth');

router.post('/start', auth, sessionController.startSession);

router.post('/:id/end', auth, sessionController.endSession);

router.get('/:id', auth, sessionController.getSessionById);

router.get('/', auth, sessionController.getSessions);

module.exports = router;
