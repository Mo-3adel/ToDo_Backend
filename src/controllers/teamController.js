const Team = require('../models/teamModel');
const Project = require('../models/projectModel');
const Task = require('../models/taskModel');

// Get all team members
const getAllTeamMembers = async (req, res) => {
    try {  
        const teamMembers = await Team.find().populate('projects').populate('tasks');
        res.json({teamMembersLength: teamMembers.length, teamMembers});
    }   catch (err) {         
        res.status(500).send(err.message);  
    }
};

// Create a new team member
const createTeamMember = async (req, res) => {
    try {
        const { name, role, email, projects , tasks } = req.body;
        const newTeamMember = new Team({
            name,
            role,
            email,
            projects,   
            tasks
        });
        const savedTeamMember = await newTeamMember.save();
        await Project.updateMany(
            { _id: { $in: projects } },
            { $push: { teamMembers: savedTeamMember._id } }
        );
        await Task.updateMany(
            { _id: { $in: tasks } },
            // using $set since the task assignedTo field should have only one team member  
            //can change to $push if multiple team members can be assigned to a task
            { $set: { assignedTo: savedTeamMember._id } }
        );

        
        res.status(201).json(savedTeamMember);
    }   catch (err) {
        res.status(500).send(err.message);
    }   
};

const updateTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, email, projects = [], tasks = [] } = req.body;

    // 1️⃣ Get old member data
    const oldMember = await Team.findById(id);
    if (!oldMember) return res.status(404).json({ message: "Team member not found" });

    // 2️⃣ Update member fields
    const updatedMember = await Team.findByIdAndUpdate(
      id,
      { name, role, email, projects, tasks },
      { new: true }
    );

    // 3️⃣ Sync projects
    const removedProjects = oldMember.projects.filter(
      p => !projects.includes(p.toString())
    );
    const addedProjects = projects.filter(
      p => !oldMember.projects.map(op => op.toString()).includes(p)
    );

    if (removedProjects.length)
      await Project.updateMany(
        { _id: { $in: removedProjects } },
        { $pull: { Members: id } }
      );

    if (addedProjects.length)
      await Project.updateMany(
        { _id: { $in: addedProjects } },
        { $addToSet: { Members: id } }
      );

    // 4️⃣ Sync tasks
    const removedTasks = oldMember.tasks.filter(
      t => !tasks.includes(t.toString())
    );
    const addedTasks = tasks.filter(
      t => !oldMember.tasks.map(ot => ot.toString()).includes(t)
    );

    if (removedTasks.length)
      await Task.updateMany(
        { _id: { $in: removedTasks }, assignedTo: id },
        { $unset: { Members: "" } }
      );

    if (addedTasks.length)
      await Task.updateMany(
        { _id: { $in: addedTasks } },
        { $set: { Members: id } }
      );

    res.json(updatedMember);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a team member
const deleteTeamMember = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Team.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Team member not found" });

    // Remove from all projects
    await Project.updateMany({}, { $pull: { Members: id } });

    // Unassign from all tasks
    await Task.updateMany({ Members: id }, { $unset: { Members: "" } });

    res.json({ message: "Team member deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
    getAllTeamMembers,
    createTeamMember,
    updateTeamMember,
    deleteTeamMember
};  