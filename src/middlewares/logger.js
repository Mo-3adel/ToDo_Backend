const fs = require('fs');
const path = require('path');

const logger = (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        const log = `${new Date().toISOString()} | ${req.method} ${req.originalUrl} | ${res.statusCode} | ${duration}ms\n`; 
        const logFilePath = path.join(__dirname, '..','..', 'logs', 'server.log');  
        fs.appendFile(logFilePath, log, (err) => {
            if (err) {
                console.error('Failed to write log:', err);
            }
        });     
    });

    

    next();
}   ;   
module.exports = logger;    