const User = require('../models/users');
const Post = require('../models/posts');
const {sendEmail} = require('../middlewares/sendEmail');
const crypto = require('crypto');

//register user
exports.register = async (req,res)=>{
    try {
        const {username,email,name,password} = req.body;

        let user = await User.findOne({email});
        if(user){
            res.status(400).json({
                success: false,
                message: "Email already exists"
            })
            return;
        }

        let user_ = await User.findOne({username});
        if(user_){
            res.status(400).json({
                success: false,
                message: "Username already exists"
            })
            return;
        }

        const newUserData = {
            username,email,name,password,
            avatar:{
                publicID: "sample ID",
                url: "sample url"
            }
        }

        const newUser = await User.create(newUserData);

        const token = newUser.generateToken();

        const options = {
            expire: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            httpOnly: true
        }

        res.status(201).cookie("token",token,options).json({
            success: true,
            user: newUser,
            token,
            message: "Welcome to tVITter"
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
        return;
    }
}

//login user
exports.login = async (req,res)=>{

    try {
        
        const {username, password} = req.body;

        const user = await User.findOne({ username }).select("+password");
        
        if(!user){
            res.status(400).json({
                success: false,
                message: "User does not exist"
            })
            return;
        }
        const isMatch = await user.matchPassword(password);

        if(!isMatch){
            res.status(400).json({
                success: false,
                message: "Incorrect password"
            })
            return;
        }

        const token = user.generateToken();

        const options = {
            expire: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            httpOnly: true
        }

        res.status(200).cookie("token",token,options).json({
            success: true,
            user,
            token
        })

    } catch (error) {
        res.status(500).json({
            success:false,
            message: error.message,
        })
        return;
    }
}

//update password
exports.updatePassword = async(req,res)=>{
    try {
        const user = await User.findById(req.user._id).select("+password");

        const {oldPassword,newPassword} = req.body;

        if(!oldPassword || !newPassword){
            return res.status(404).json({
                success: false,
                message: "Please enter old and new  password"
            })
        }

        if(oldPassword.length<6){
            return res.status(400).json({
                success: false,
                message: "Incorrect old password"
            })
        }

        console.log(oldPassword);

        const isMatch = await user.matchPassword(oldPassword);

        if(!isMatch){
            return res.status(400).json({
                success: false,
                message: "Incorrect old password"
            })
        }

        if(newPassword.length<6){
            return res.status(400).json({
                success: false,
                message: "Invalid new password",
            })
        }
        user.password = newPassword;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password updated!"
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
        return;
    }
}

//update profile
exports.updateProfile = async(req,res)=>{
    try {
        const user = await User.findById(req.user._id);

        const {email,name,username,dob} = req.body;

        if(email){
            user.email = email;
        }

        if(name){
            user.name = name;
        }

        if(dob){
            dobnew = dob.toString()+'Z';
            user.dob = dobnew;
        }

        if(username){
            user.username = username;
        }

        //User Avatar : TODO

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully!"
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

//delete profile
exports.deleteProfile = async (req,res)=>{
    try {
        
        const user = await User.findById(req.user._id);
        const posts = user.posts;
        const followers = user.followers;
        const followings = user.following;
        const userId = user._id;
        await user.remove();

        for(let i = 0;i<posts.length;i++){
            const post = await Post.findById(posts[i]);
            await post.remove();
        }

        for(let i = 0;i<followers.length;i++){
            const follower = await User.findById(followers[i]);

            const index = await follower.followers.indexOf(follower);
            follower.followers.splice(index,1);

            await follower.save();
        }

        for(let i = 0;i<followings.length;i++){
            const following = await User.findById(followings[i]);

            const index = await following.following.indexOf(following);
            following.following.splice(index,1);

            await following.save();
        }

        return res.status(200)
            .cookie("token",null,{
                expires: new Date(Date.now()),
                httpOnly: true
            }).json({
                success:true,
                message: "Profile deleted successfully"
            })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

//forgot password
exports.forgotPassword = async(req,res)=>{

    try {

        const email = req.body.email;
        const user = await User.findOne({email});

        if(!user){
            return res.status(404).json({
                success: false,
                message: "Invalid email"
            })
        }

        const resetToken = await user.generateResetPasswordToken();

        await user.save();

        const resetURL = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;


        const message = `Please click on the link to reset your password: \n\n ${resetURL}`;

        try {
            
            await sendEmail({
                email: user.email,
                subject: "Reset Password for tVITter",
                message: message,
            });

            return res.status(200).json({
                success: true,
                message: `Email sent to ${email}`
            })

        } catch (error) {
            user.resetPasswordToken= undefined;
            user.resetPasswordTokenExpire= undefined;

            await user.save();

            return res.status(500).json({
                success: false,
                messsage: error.message,
            })
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

//reset password
exports.resetPassword = async(req,res)=>{
    try {
        
        const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

        const user =await User.findOne({
            resetPasswordToken,
            resetPasswordTokenExpire: {$gt: Date.now()}
        });

        if(!user){
            return res.status(401).json({
                success: false,
                message: "Token is invalid or has expired"
            })
        }

        user.password = req.body.password;

        user.resetPasswordToken = undefined,
        user.resetPasswordTokenExpire = undefined,

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password Updated successfully!"
        })


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}



//My profile details
exports.myProfile = async(req,res)=>{
    try {
        
        const user = await User.findById(req.user._id).populate("posts followers following");

        return res.status(200).json({
            success: true,
            user
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

//view profile of followed user
exports.viewProfile = async (req,res)=>{
    try {

        const user = await User.findById(req.params.id).populate("posts");

        const loggedInUser = await User.findById(req.user._id);

        if(!user){
            return res.status(404).json({
                success: false,
                message: "Profile not found"
            })
        }

        console.log(user.followers);
        if(!user.followers.includes(loggedInUser._id)){
            const username = user.username;
            return res.status(400).json({
                success: false,
                message: "Please follow to view their posts."
            })
        }else{
            console.log(user);
            return res.status(200).json({
                success: true,
                user
            })
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

//logout user
exports.logout = async (req,res)=>{
    try {
        
        return res
            .status(200)
            .cookie("token",null,{expires: new Date(Date.now()),httpOnly: true})
            .json({
                success: true,
                message: "Logged Out Successfully"
            })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

//follow user
exports.followUser = async (req,res)=>{
    try {
        
        const userToFollow = await User.findById(req.params.id);
        const loggedInUser = await User.findById(req.user._id);

        if(!userToFollow){
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        if(loggedInUser.following.includes(userToFollow._id)){

            const indexFollow = loggedInUser.following.indexOf(userToFollow._id);
            loggedInUser.following.splice(indexFollow,1);

            const indexUser = userToFollow.followers.indexOf(loggedInUser._id);
            userToFollow.followers.splice(indexUser,1);

            await loggedInUser.save();
            await userToFollow.save();

            return res.status(200).json({
                success: true,
                message: "User Unfollowed!"
            })

        }else{
            loggedInUser.following.push(userToFollow._id);
            userToFollow.followers.push(loggedInUser._id);

            await loggedInUser.save();
            await userToFollow.save();

            return res.status(200).json({
                success: true,
                message: "User Followed!"
            })
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

