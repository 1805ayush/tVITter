const mongoose = require('mongoose');
const mongoString = process.env.DATABASE_URL;

require('dotenv').config({path:"Tvitter-backend/config/config.env"})

exports.connectDatabase=()=>{
    mongoose
            .connect(mongoString)
            .then((con)=>console.log(`Database connected`))
            .catch((err)=>console.log(`err`))
}

