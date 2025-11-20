
const Project = require('../models/project_model');


const getAllProjects = async (req, res) => {   
    try{
    const projects = await Project.find().populate('tasks').populate('Members'); 
    res.json({projectslength: projects.length, projects});
    } catch(err){
        res.status(500).send(err.message);
    }
}


// For demonstration i will get project by title sent as req parameter
// Ex /api/v1/projects/projectTitle
// I could have used id but this is just to show another way of querying
// Also could be done by sending it as req body but would need to change the routers order to avoid conflict with create project route

const getProjectByTitle = async (req, res) => {   
    try{
        const {title}= req.params;
        const project = await Project.findOne({title}).populate('tasks').populate('Members');  
        if (!project) {
            return res.status(404).send('Project not found');
        }
        res.json(project); 


    } catch(err){
        res.status(500).send(err.message);
    }   
}

const createProject = async (req, res) => { 
    try{
        const { title,description , teamMembers , dueDate } = req.body;
        const newProject = new Project({
            title,
            description,
            teamMembers,
            dueDate
        });
        const savedProject = await newProject.save();
        res.status(201).json(savedProject);
    }
    catch(err){ 
        res.status(500).send(err.message);
    }   
}

// Assume id is passed as req parameter
// Ex /api/v1/projects/:id
const updateProject = async (req, res) => {   
    try{
        const { id } = req.params;
        const { title, description, teamMembers , dueDate } = req.body;
        const updatedProject = await Project.findByIdAndUpdate(
            id,
            { title, description, teamMembers , dueDate },
            { new: true }
        );
        if (!updatedProject) {  
            return res.status(404).send('Project not found');
        }
        res.json(updatedProject);
    }
    catch(err){
        res.status(500).send(err.message);
    }
}

// Assume id is passed as req parameter
// ex /api/v1/projects/:id
const deleteProject = async (req, res) => {   
    try{
        const { id } = req.params;
        const deletedProject = await Project.findByIdAndDelete(id);
        if (!deletedProject) {
            return res.status(404).send('Project not found');
        }
        res.status(204).json({message: 'Project deleted successfully'   });
    } catch(err){
        res.status(500).send(err.message);
    }
}   

module.exports = {
    getAllProjects,
    getProjectByTitle,
    createProject,
    updateProject,
    deleteProject
};