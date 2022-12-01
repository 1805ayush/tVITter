const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const Schema = mongoose.Schema;

const UserSchema = new Schema({
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

UserSchema.methods.matchPassword = async function (password){
    return await bcrypt.compare(password.password,this.password);
}

UserSchema.methods.generateToken = function(){
    return jwt.sign({_id:this._id},process.env.JWT_SECRET);
}

module.exports = User = mongoose.model("User",UserSchema);