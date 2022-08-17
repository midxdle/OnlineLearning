const mongoose = require("mongoose");
const { MongoClient } = require("mongodb");

let db = () => {
  const uri =
    "mongodb+srv://midxdle:fFbE2DpWoxmGTAXF@cluster0.axsj3.mongodb.net";
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  client.connect((err) => {
    const collection = client.db("test").collection("users");
    client.close();
  });
  mongoose
    .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("connected..."))
    .catch((err) => console.log(err));

  let db = mongoose.connection;
};

module.exports = db();
