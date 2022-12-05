const Post = require("../models/posts");
const User = require("../models/users");

//create post
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

        user.posts.push(newPost._id);

        await user.save();

        return res.status(201).json({
            success:true,
            post: newPost,
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }

};

//delete posts
exports.deletePost = async(req,res)=>{

    try {
        const post = await Post.findById(req.params.id);

        if(!post){
            return res.status(404).json({
                success: false,
                message: "Post not found"
            })
        }

        if(post.user.toString() !== req.user._id.toString()){
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            })
        }


        await post.remove();

        const user = await User.findById(req.user._id);

        const index = user.posts.indexOf(req.params.id);

        user.posts.splice(index,1);

        await user.save();

        return res.status(200).json({
            success:true,
            message:"Post deleted."
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

//like and unlike posts
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
        
        return res.status(500).json({
            success: false,
            message: error.message
        })

    }
}

//edit caption
exports.editCaption = async(req,res)=>{
    try {
        
        const post = await Post.findById(req.params.id);

        const {newCaption} = req.body;

        if(!post){
            return res.status(404).json({
                success: false,
                message: "Post not found"
            })
        }

        if(!newCaption){
            return res.status(404).json({
                success: false,
                message: "Please enter a caption."
            })
        }

        if(post.user.toString() !== req.user._id.toString()){
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            })
        }

        post.caption = newCaption;

        await post.save();

        return res.status(200).json({
            success: true,
            message: "Caption updated successfully!"
        })


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

//get posts of following
exports.postsOfFollowing = async(req,res)=>{
    try {
        const user = await User.findById(req.user._id);

        const posts = await Post.find({
            user: {
                $in: user.following
            }
        })

        return res.status(200).json({
            success:true,
            posts,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

//comment on a post
exports.comment = async(req,res)=>{
    try {
        const post = await Post.findById(req.params.id);

        if(!post){
            return res.status(404).json({
                success: false,
                message: "Post not found"
            })
        }

        const user = await User.findById(req.user._id);

        const comment = req.body.comment;

        post.comments.push({
            user: user,
            comment: comment,
        })

        console.log(post.comments);
        await post.save();

        return res.status(200).json({
            success: true,
            post,
            message: "Commented successfully!"
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

//edit comment
exports.editComment = async (req,res)=>{

    try {

        const posts = await Post.find({}).populate("comments");

        let foundComment = false;

        let commentIndex;
        let postIndex;

        posts.forEach((post,pindex)=>{
            post.comments.forEach((comment,cindex)=>{
                if(comment._id.toString()===req.params.id.toString()){
                    foundComment=true;
                    postIndex = pindex;
                    commentIndex = cindex; 
                }
            })
        });


        if(foundComment){
            const oldcomment = posts[postIndex].comments[commentIndex];
            oldcomment.comment = req.body.newComment;
            await posts[postIndex].save();

            return res.status(200).json({
                success: true,
                comment: "Edited comment!"
            })
        }else{
            return res.status(404).json({
                success: false,
                message: "Comment not found"
            })
        }
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }

}

//delete comment
exports.deleteComment = async(req,res)=>{
    try {
        const posts = await Post.find({}).populate("comments");

        let foundComment = false;

        let commentIndex;
        let postIndex;

        posts.forEach((post,pindex)=>{
            post.comments.forEach((comment,cindex)=>{
                if(comment._id.toString()===req.params.id.toString()){
                    foundComment=true;
                    postIndex = pindex;
                    commentIndex = cindex; 
                }
            })
        });


        if(foundComment){
            posts[postIndex].comments.splice(commentIndex);
            await posts[postIndex].save();

            return res.status(200).json({
                success: true,
                comment: "Deleted comment!"
            })
        }else{
            return res.status(404).json({
                success: false,
                message: "Comment not found"
            })
        }
        
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}