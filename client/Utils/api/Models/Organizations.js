
const mongoose = require('mongoose');

const Schema = mongoose.Schema({
    name :{
        type:String,
        required:true,
        minLength:3,
    },
    owner :{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    members :[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
})


module.exports = mongoose.model('Organization', Schema);