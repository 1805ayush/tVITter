const express = require('express');
const { createPost } = require('../controllers/post');

const router = express.Router();

router.route("/posts/upload").post(createPost);

module.exports = router;
