const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const port = process.env.PORT || 3000;

require("dotenv").config();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("running....");
});
app.listen(port, () => {
  console.log(`server is running  ${port}`);
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gslw7jh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const collection = client.db("gardener-community").collection("gardeners");
    const collection2 = client.db("gardener-community").collection("tip");

    app.post("/gardeners", async (req, res) => {
      const gardener = req.body;
      const result = await collection.insertOne(gardener);
      res.send(result);
    });

    app.get("/gardeners", async (req, res) => {
      const result = await collection
        .find({ status: "Active" })
        .limit(6)
        .toArray();
      res.send(result);
    });
    app.get("/allgardeners", async (req, res) => {
      const result = await collection.find().toArray();
      res.send(result);
    });

    app.post("/tip", async (req, res) => {
      const tip = req.body;
      const result = await collection2.insertOne(tip);
      res.send(result);
    });
    app.get("/tip", async (req, res) => {
      const result = await collection2.find().limit(6).toArray();
      res.send(result);
    });
    app.get("/alltip", async (req, res) => {
      const result = await collection2
        .find({ Availability: "Public" })
        .toArray();
      res.send(result);
    });

    app.get("/tipdetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await collection2.findOne(query);
      res.send(result);
    });

    app.get("/mytips/:email", async (req, res) => {
      const email = req.params.email;

      const result = await collection2.find({ email }).toArray();
      res.send(result);
    });

    app.put("/mytips/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };

      const options = { upsert: true };

      const upldatedtip = req.body;
      const upldatedDoc = {
        $set: upldatedtip,
      };
      const result = await collection2.updateOne(filter, upldatedDoc, options);
      res.send(result);
    });

    app.delete("/delete/:id", async (req, res) => {
      const id = req.params.id;
      const quary = { _id: new ObjectId(id) };
      const result = await collection2.deleteOne(quary);
      res.send(result);
    });

    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);
