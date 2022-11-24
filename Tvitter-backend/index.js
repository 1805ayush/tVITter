require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const mongoString = process.env.DATABASE_URL;

mongoose.connect(mongoString);
const database = mongoose.connection;

database.on('error',(error)=>{
    console.log(error);
})

database.once('connected',(error)=>{
    console.log("Database connected");
})

const app  = express();

app.use(express.json());

app.listen(3000,()=>{
    console.log(`Server started on port ${3000}`);
});