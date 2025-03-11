const mongoose = require('mongoose');
const path = require('path');  
require('dotenv').config();

async function connect() {
    try {
        await mongoose.connect(process.env.MONGODB);
        
        console.log('Connect successfully!!!');
    } catch (error) {
        console.log('Connect failure!!!', error);
    }
}

module.exports = { connect };