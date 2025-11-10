const express = require('express');

const dotenv = require('dotenv');
dotenv.config();

const taskRouter = require('./routers/taskRouter');
const projectRoute = require('./routers/project_route');
const mangodbConfig = require('./config/mangodb');



mangodbConfig();


const app = express();
app.use(express.json());

app.use('/api/v1', projectRoute);
app.use('/api/v1', taskRouter);

module.exports = app;