const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const teamSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true, 
        unique: true    
    },  
    joinedAt: { 
        type: Date, 
        default: Date.now
    },
    projects: { 
        type: [Schema.Types.ObjectId],  
        ref: 'Projects'
    },
    tasks: { 
        type: [Schema.Types.ObjectId],  
        ref: 'Task'
    }   
});

Team = mongoose.model('Team', teamSchema);
module.exports = Team;  