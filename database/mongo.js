 const mongoose = require('mongoose');

 let db = function () {
      mongoose.connect('mongodb+srv://midxdle:fFbE2DpWoxmGTAXF@cluster0.axsj3.mongodb.net/onlineLearning?retryWrites=true&w=majority');
      let db = mongoose.connection;
      db.on('error', console.error.bind(console, 'Connection Error!'));
      db.once('open', function () {
        console.log('Database Connected...');
      });
 }

 module.exports = db();