const express = require('express');
const { createPost, likeAndUnlikePost, deletePost, postsOfFollowing, editCaption, comment, editComment, deleteComment } = require('../controllers/post');
const { isAuthenticated } = require('../middlewares/auth');

const router = express.Router();

router.route("/post/upload").post(isAuthenticated,createPost);

router
    .route("/post/:id")
    .get(isAuthenticated,likeAndUnlikePost)
    .put(isAuthenticated,editCaption)
    .delete(isAuthenticated,deletePost);

router.route("/posts").get(isAuthenticated,postsOfFollowing);

router
    .route("/post/comment/:id")
    .post(isAuthenticated,comment)
    .put(isAuthenticated,editComment)
    .delete(isAuthenticated,deleteComment);


module.exports = router;
