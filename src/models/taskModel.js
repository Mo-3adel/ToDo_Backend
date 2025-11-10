const mongoose = require('mongoose');


const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed'],
        default: 'pending'
    },
    assignedTo: {
        type: [String],
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    project:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Projects',
        required: true
    }
});

const Task = mongoose.model('Task', TaskSchema);
module.exports = Task;