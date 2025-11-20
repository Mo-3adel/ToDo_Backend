const mongoose = require('mongoose');   
const Schema = mongoose.Schema;

const projectSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true  
    },
    teamMembers:{
        type: [String], 
        required: true  

    },
    createdAt: {
        type: Date,
        default: Date.now
    } , 
    dueDate: {
        type: Date,
        required: true
    },
    tasks: {
        type: [Schema.Types.ObjectId],
        ref: 'Task'
    },
    // New field to reference team members while keeping the teamMembers array to store names manually in the requisite body withoout creating members fist
    Members: {
        type: [Schema.Types.ObjectId],
        ref: 'Team'
    }
})

Project=mongoose.model('Projects', projectSchema);
module.exports=Project;

