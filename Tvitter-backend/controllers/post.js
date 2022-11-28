const Post = require("../models/posts");

exports.createPost = async(req,res)=>{

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