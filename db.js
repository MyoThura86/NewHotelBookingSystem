const mongoose = require("mongoose");

var mongoURL = 'mongodb+srv://myowithmom:BODfiZB0iaeyFke7@cluster0.kypw0.mongodb.net/sheyrooms'

mongoose.connect(mongoURL , {useUnifiedTopology : true, useNewUrlParser: true})

var connection = mongoose.connection

connection.on('error', () =>{
    console.log('Mongo DB Connection failed')
})

connection.on('connected' , () =>{
    console.log("Mongo DB Connection Successful")
} )

module.exports = mongoose;