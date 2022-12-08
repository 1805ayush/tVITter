const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({

    caption: String,

    image:{
        publicID: String,
        url: String
    },

    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    createdAt:{
        type: Date,
        default: Date.now,
    },

    likes:[
        { 
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
           
        }
    ],

    comments: [{
        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        comment:{
            type: String,
        }
        }
    ],

    parentPost:{
        type: mongoose.Schema.Types.ObjectID,
        ref: "Post"
    },

    replies: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
        }
    ],
      
});


module.exports = mongoose.model("Post", postSchema);