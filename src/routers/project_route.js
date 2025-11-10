const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project_controller');

router.get('/projects', projectController.getAllProjects);  
router.get('/projects/:title', projectController.getProjectByTitle);  
router.post('/projects', projectController.createProject); 
router.put('/projects/:id', projectController.updateProject);  
router.delete('/projects/:id', projectController.deleteProject);    

module.exports = router;