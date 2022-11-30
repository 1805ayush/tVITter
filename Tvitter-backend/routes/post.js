const express = require('express');
const { createPost } = require('../controllers/post');
const { isAuthenticated } = require('../middlewares/auth');

const router = express.Router();

router.route("/posts/upload").post(isAuthenticated,createPost);

module.exports = router;
