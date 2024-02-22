const {Schema, model} = require('mongoose');

const schema = new Schema({
    name:{
        type:String,
        required:true,
        minLength:3
    },
    organization:{
        type:Schema.Types.ObjectId,
        ref:'Organization',
        required:true,
    },
    createdBy:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    template:{
        type:String,
        ref:'Template',
        required:true,
    },
})

module.exports = model('template', schema);