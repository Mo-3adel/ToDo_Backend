const express = require('express');
// Used a custom logger for demonstration and morgan for practical logging
const CustomLogger = require('./middlewares/logger.js');
const morganMiddleware = require('./middlewares/morgan.js');

// report generation function 
const generateTasksReport = require('./utils/reportsGen');

const dotenv = require('dotenv');
dotenv.config();

const taskRouter = require('./routers/taskRouter');
const projectRoute = require('./routers/project_route');
const TeamRoute = require('./routers/teamRoute');
const mangodbConfig = require('./config/mangodb');



mangodbConfig();


const app = express();
app.use(express.json());
app.use(CustomLogger);  
app.use(morganMiddleware);

app.use('/api/v1', projectRoute);
app.use('/api/v1', taskRouter);
app.use('/api/v1', TeamRoute);

app.get('/api/v1/report', (req, res) => {
    generateTasksReport();
    res.send('Report generated successfully');
    
});


module.exports = app;