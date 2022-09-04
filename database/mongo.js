const mongoose = require("mongoose");
const { MongoClient } = require("mongodb");

// connecting to database
let db = () => {
  const uri =
    "mongodb+srv://midxdle:fFbE2DpWoxmGTAXF@cluster0.axsj3.mongodb.net";
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  client.connect((err) => {
    client.db("test");
    client.close();
  });
  mongoose
    .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("connected..."))
    .catch((err) => console.log(err));

  let db = mongoose.connection;
};

module.exports = db();
