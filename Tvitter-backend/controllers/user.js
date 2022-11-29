const User = require('../models/users');

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

        const token = user.generateToken();

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
        res.status(500).json({
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
        const isMatch = await user.matchPassword({password});

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