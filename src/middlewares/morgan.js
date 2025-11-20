const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '..', '..', 'logs', 'morgan.log');
const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });
const morganMiddleware = morgan('combined', { stream: logStream });

module.exports = morganMiddleware;