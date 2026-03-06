const { MongoClient, ObjectId } = require("mongodb");
const fs = require("fs");

const uri = "mongodb+srv://khalid:2005@cluster0.qswyulc.mongodb.net/";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const database = client.db("test"); // Specify your database name
    const collection = database.collection("chapters"); // Specify your collection name

    // Read and preprocess the JSON file
    const data = JSON.parse(
      fs.readFileSync("./webnovels.chapters.json", "utf8"),
    );
    const users = data.map((user) => {
      if (user._id && user._id.$oid) {
        user._id = new ObjectId(user._id.$oid);
      }
      return user;
    });

    // Insert the preprocessed data into the collection
    const result = await collection.insertMany(users);
    console.log(`${result.insertedCount} documents were inserted`);
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
