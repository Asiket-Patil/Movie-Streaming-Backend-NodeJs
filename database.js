const mongoose = require('mongoose');

const mongoDbUrl = 'mongodb://localhost:27017/movieHub'; 

mongoose.connect(mongoDbUrl)
  .then(() => console.log('Connection Successful...'))
  .catch(err => console.error('Can not connect to MongoDB...', err));
  
  module.exports = mongoose;