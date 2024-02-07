const { Schema, model } = require('mongoose');

const schema = new Schema({
    Question:{
        type:String,
        required:true,
    },
    AssignmentId:{
        type:Schema.Types.ObjectId,
        ref:'Assignment',
        required:true,
    }
    ,subHeading:{
        type:String,
        required:false,
    },
    type:{
        type:String,
        required:true,
    
    },
    options:{
        type:[String],
        required:false,
    },
    answer:{
        type:String,
        required:false,
    },
    marks:{
        type:Number,
        required:true,
    },
    level:{
        type:Number,
        required:true,
    },
    negativeMarks:{
        type:Number,
        required:false,
    },
})

module.exports = model('Question', schema);