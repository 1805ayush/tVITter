const mongoose = require('mongoose');
const bcrypt = require('bcrypt')

const Schema = mongoose.Schema;

let UserSchema = new Schema({
    avatar:{
        publicID: String,
        url: String
    },
    username:{
        type: String,
        required: [true,"Please enter a username"],
        unique:[true,"Username already exists"]
    },
    name:{
        type: String,
        required: [true,"Please enter a name"],
    },
    email:{
        type: String,
        required: [true,"Please enter an email"],
        unique:[true,"Email already exists"]
    },
    password: {
        type: String,
        required: [true, "Please enter a password"],
        minlength: [6, "Password must be at least 6 characters"],
        select: false,
    },
    dob:{
        type: Date,
        default: Date.now,
    },
    posts:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        }
    ],
    followers:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    following:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ]
});

UserSchema.pre("save",async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password,10);
    }
    next();
})

module.exports = User = mongoose.model("User",UserSchema);