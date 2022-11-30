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

exports.likeAndUnlikePost = async (req, res)=>{
    try {
        
        const post = await Post.findById(req.params.id);

        if(!post){
            return res.status(404).json({
                success: false,
                message: true,
            })
        }

        if (post.likes.includes(req.user._id)) {
            const index = await post.likes.indexOf(req.user._id);
            post.likes.splice(index,1);

            await post.save();
            return res.status(200).json({
                success: true,
                message: "Post Unliked"
            })
        }else{
            post.likes.push(req.user._id);

            await post.save();
            return res.status(200).json({
                success: true,
                message: "Post Liked"
            })
        }

    } catch (error) {
        
        res.status(500).json({
            success: false,
            message: error.message
        })

    }
}