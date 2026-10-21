const mongoose = require('mongoose')


const connectDB = async() => {
    try{
        await mongoose.connect(process.env.MONGOURL, {serverSelectionTimeoutMS: 2500})
        console.log("MongoDB connected")
    } catch(error){
        console.log(error)
        process.exit(1)
    }
}

module.exports = connectDB