const projectModel = require('../models/project_model');
const Task = require('../models/taskModel');
const fs = require('fs');   
const path = require('path');

// Generate report of tasks per project 
const generateTasksReport = async () => {   
    const projects = await projectModel.find().populate('tasks');
    const report = projects.map(project => ({
        projectTitle: project.title,
        totalTasks: project.tasks.length,
        completedTasks: project.tasks.filter(task => task.status === 'completed').length,
        pendingTasks: project.tasks.filter(task => task.status !== 'completed').length,
        completionRate: project.tasks.length === 0 ? 0 : ((project.tasks.filter(task => task.status === 'completed').length / project.tasks.length) * 100).toFixed(2) + '%'
    }));
    
    const reportPath = path.join(__dirname, '..','..', 'reports', 'tasks_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

};

module.exports =  generateTasksReport ;   