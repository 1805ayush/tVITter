const express = require('express');
const { register } = require('../controllers/user');

const router = express.Router();

router.post('/register').post(register);

module.exports = router;