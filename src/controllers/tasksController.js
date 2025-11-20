const Task = require('../models/taskModel');    
const Project = require('../models/project_model');
const Team = require('../models/teamModel');

// Helper function to convert emails to team member IDs
// Instead of writing id everytime we pass an email since i made it unique
const convertEmailsToIds = async (assignedTo) => {
    // Ensure assignedTo is an array
    if (!assignedTo) return [];
    const assignedToArray = Array.isArray(assignedTo) ? assignedTo : [assignedTo];
    if (assignedToArray.length === 0) return [];

    // Separate emails and IDs
    // We can use ids directly if passed
    const emails = assignedToArray.filter(item => typeof item === 'string' && item.includes('@'));
    const ids = assignedToArray.filter(item => typeof item === 'string' && !item.includes('@') && item.match(/^[0-9a-fA-F]{24}$/));

    // Find team members by email
    let foundMembers = [];
    if (emails.length > 0) {
        foundMembers = await Team.find({ email: { $in: emails } });
    }
    
    const foundIds = foundMembers.map(member => member._id.toString());
    const notFound = emails.filter(email => !foundMembers.some(member => member.email === email));

    // If any emails were not found, throw an error
    if (notFound.length > 0) {
        throw new Error(`Team member(s) not found for email(s): ${notFound.join(', ')}`);
    }

    // Return all valid IDs (from input and found by email)
    return [...ids, ...foundIds];
};

// Tasks Crud Operations
// Will use project reference to link tasks to projects
const createTask = async (req, res) => {
    try {
        const { title, description, assignedTo, dueDate, status, project} = req.body;
        
        // Convert emails to IDs before creating task
        const convertedAssignedTo = await convertEmailsToIds(assignedTo);
        
        const newTask = new Task({
            title,
            description,
            assignedTo: convertedAssignedTo,
            dueDate,
            status,
            project  // Reference to associated project
        });
        const savedTask = await newTask.save();

        // Add this task to the project's task list
        await Project.findOneAndUpdate({ title: project }, { $push: { tasks: savedTask._id } });
        
        // Add this task to each assigned team member's task list
        if (savedTask.assignedTo && savedTask.assignedTo.length > 0) {
            await Team.updateMany(
                { _id: { $in: savedTask.assignedTo } },
                { $push: { tasks: savedTask._id } }
            );
        }

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

const updateTask = async (req, res) => {   
    try {
        const { id } = req.params;

        //hold existing task id so we can use it later to remove the task from team members and projects
        const existingTask = await Task.findById(id);
        if (!existingTask) {
            return res.status(404).send('Task not found');
        }

        const { title, description, assignedTo, dueDate, status, project } = req.body;

        // Prepare update object and only include provided fields
        const updateFields = {};
        if (status !== undefined) updateFields.status = status;
        if (title !== undefined) updateFields.title = title;
        if (description !== undefined) updateFields.description = description;
        if (dueDate !== undefined) updateFields.dueDate = dueDate;
        if (project !== undefined) updateFields.project = project;

        // Convert emails to IDs if assignedTo is provided
        if (assignedTo !== undefined) {
            updateFields.assignedTo = await convertEmailsToIds(assignedTo);
        }

        const updatedTask = await Task.findByIdAndUpdate(
            id,
            updateFields,
            { new: true }
        );
        if (!updatedTask) {
            return res.status(404).send('Task not found');
        }
        
        // if project is updated we need to update the tasks array in both old and new project
        if (req.body.project && req.body.project !== existingTask.project) {
            // Remove from old project 
            await Project.findOneAndUpdate({ title: existingTask.project }, { $pull: { tasks: existingTask._id } });
            // Add to new project
            await Project.findOneAndUpdate({ title: updatedTask.project }, { $addToSet: { tasks: updatedTask._id } });
        }
        
        // if team members are updated, update their task arrays
        if (req.body.assignedTo) {
            const existingAssignedIds = existingTask.assignedTo.map(id => id.toString());
            const newAssignedIds = updatedTask.assignedTo.map(id => id.toString());
            
            // Find team members to remove from
            const toRemove = existingAssignedIds.filter(id => !newAssignedIds.includes(id));
            // Find team members to add to
            const toAdd = newAssignedIds.filter(id => !existingAssignedIds.includes(id));
            
            // Remove task from old team members
            if (toRemove.length > 0) {
                await Team.updateMany(
                    { _id: { $in: toRemove } },
                    { $pull: { tasks: existingTask._id } }
                );
            }
            
            // Add task to new team members
            if (toAdd.length > 0) {
                await Team.updateMany(
                    { _id: { $in: toAdd } },
                    { $push: { tasks: updatedTask._id } }
                );
            }
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
        await Project.findOneAndUpdate({ title: deletedTask.project }, { $pull: { tasks: deletedTask._id } });

        // Remove this task from all assigned team members' task lists
        if (deletedTask.assignedTo && deletedTask.assignedTo.length > 0) {
            await Team.updateMany(
                { _id: { $in: deletedTask.assignedTo } },
                { $pull: { tasks: deletedTask._id } }
            );
        }

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