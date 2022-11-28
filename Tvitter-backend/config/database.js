const mongoose = require('mongoose');
const mongoString = process.env.MONGO_URI;

require('dotenv').config({path:"Tvitter-backend/config/config.env"})

exports.connectDatabase=()=>{
    mongoose
            .connect(mongoString)
            .then((con)=>console.log(`Database connected ${con.connection.host}`))
            .catch((err)=>console.log(`err`))
}

