const mongoose = require('mongoose');

const mangodbConfig = () => {

    try{
    mongoose.connect(process.env.MongoDB_Connection_String, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');
    }
    catch(err){
        console.error('Error connecting to MongoDB', err);
    }
}

module.exports = mangodbConfig;