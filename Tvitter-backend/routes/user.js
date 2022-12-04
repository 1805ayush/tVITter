const express = require('express');
const { register, login, followUser, logout, updatePassword, updateProfile, deleteProfile, myProfile, viewProfile } = require('../controllers/user');
const {isAuthenticated} = require('../middlewares/auth')

const router = express.Router();

router.route("/register").post(register);

router.route("/login").post(login);

router.route("/logout").get(logout);

router.route("/follow/:id").get(isAuthenticated, followUser); 

router.route("/update/password").put(isAuthenticated,updatePassword);

router.route("/update/profile").put(isAuthenticated,updateProfile);

router.route("/delete/me").delete(isAuthenticated,deleteProfile);

router.route("/profile/me").get(isAuthenticated,myProfile);

router.route("/profile/:id").get(isAuthenticated,viewProfile);

module.exports = router;