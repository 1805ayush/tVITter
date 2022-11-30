const Post = require("../models/posts");
const User = require("../models/users");

exports.createPost = async (req,res)=>{

    try {
        
       
        const newPostData = {
            caption : req.body.caption,
            image:{
                publicID:"req.body.publicId",
                url: "req.body.url"
            },
            user : req.user._id,
        }

        const newPost = await Post.create(newPostData);

        const user = await User.findById(req.user._id);

        console.log(newPost._id);
        user.posts.push(newPost._id);

        await user.save();

        res.status(201).json({
            success:true,
            post: newPost,
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }

};