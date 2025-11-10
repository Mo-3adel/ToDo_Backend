const Task = require('../models/taskModel');    
const Project = require('../models/project_model');
// Tasks Crud Operations
// will use project reference to link tasks to projects
const createTask = async (req, res) => {
    try {
        const { title, description, assignedTo, dueDate, status, project} = req.body;
        const newTask = new Task({
            title,
            description,
            assignedTo,
            dueDate,
            status,
            project  // Reference to associated project
        });
        const savedTask = await newTask.save();

        // Add this task to the project's task list
        await Project.findByIdAndUpdate(project, { $push: { tasks: savedTask._id } });

        res.status(201).json(savedTask);
    }   catch (err) {
        res.status(500).send(err.message);
    }
};

const getAllTasks = async (req, res) => {   
    try {
        const tasks = await Task.find(); 
        res.json({taskslength: tasks.length, tasks});
    } catch(err){
        res.status(500).send(err.message);
    }   
};  

// i'll just assume that you have the project id an dpass it as req parameter
// ex /api/v1/tasks/:id
const updateTask = async (req, res) => {   
    try {
        
        

        const { id } = req.params;

        //hold existing task id
        const existingTask = await Task.findById(id);

        const { title, description, assignedTo, dueDate,status,project } = req.body;
        const updatedTask = await Task.findByIdAndUpdate(
            id,
            { status,
                title,
                description,
                assignedTo,
                dueDate,
                project
            },
            { new: true }
        );
        if (!updatedTask) {
            return res.status(404).send('Task not found');
        }
        // if project is updated we need to update the tasks array in both old and new project
        // built a new var above called existingTask to hold existing task data and compare if the task project is changed  
        if (req.body.project && req.body.project.toString() !== existingTask.project.toString()) {
        // Remove from old project 
        await Project.findByIdAndUpdate(existingTask.project, { $pull: { tasks: existingTask._id } });

        // Add to new project
        await Project.findByIdAndUpdate(updatedTask.project, { $addToSet: { tasks: updatedTask._id } });
    }

        res.json(updatedTask);
    } catch(err){
        res.status(500).send(err.message);
    }   
};

//sama as update task ill assume you pass the id as req parameter
// ex /api/v1/tasks/:id
const deleteTask = async (req, res) => {   
    try {
        const { id } = req.params;
        const deletedTask = await Task.findByIdAndDelete(id);
        if (!deletedTask) {
            return res.status(404).send('Task not found');
        }
        // Remove this task from the project's task list
        // it need to be deleted from the project tasks array as well
        await Project.findByIdAndUpdate(deletedTask.project, { $pull: { tasks: deletedTask._id } });

        res.json({ message: 'Task deleted successfully' });
    }   catch(err){
        res.status(500).send(err.message);
    }   
};

module.exports = {
    createTask,
    getAllTasks,
    updateTask,
    deleteTask
};