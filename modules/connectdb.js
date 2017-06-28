var mongoose = require('mongoose');
var db = mongoose.createConnection('mongodb://localhost/storytree');

// db.on('error', function(err){
//   if(err) throw err;
// });

db.on('error',console.error);

db.once('open', function callback () {
  console.info('Mongo db connected successfully');
});

module.exports = db;