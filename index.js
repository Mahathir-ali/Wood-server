const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const res = require("express/lib/response");
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.utzce.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

// console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("woodData");
    const productCollection = database.collection("products");
    const ordersCollection = database.collection("orders");
    const userCollection = database.collection("users");
    const reviewCollection = database.collection("review");
    //get products
    app.get("/allProduct", async (req, res) => {
      const products = productCollection.find({});
      const result = await products.toArray();
      res.json(result);
    });
    //post product
    app.post("/products", async (req, res) => {
      const allProducts = req.body;
      const result = await productCollection.insertOne(allProducts);
      res.json(result);
    });

    // get singleProduct
    app.get("/singleProduct/:id", async (req, res) => {
      const query = { _id: ObjectId(req.params.id) };
      // console.log(query);
      const result = await productCollection.find(query).toArray();
      // console.log(result[0]);
      res.json(result[0]);
    });
    //post orders
    app.post("/orders", async (req, res) => {
      const orders = req.body;
      const result = await ordersCollection.insertOne(orders);
      console.log(result);
      res.json(result);
    });
    //get all orders
    app.get("/allOrders", async (req, res) => {
      const allOrder = ordersCollection.find({});
      const result = await allOrder.toArray();
      // console.log(result);
      res.json(result);
    });
    // specific order
    app.get("/orders", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const cursor = ordersCollection.find(query);
      const orders = await cursor.toArray();
      res.json(orders);
    });
    //post users
    app.post("/users", async (req, res) => {
      const users = req.body;
      const result = await userCollection.insertOne(users);
      console.log(result);
      res.json(result);
    });

    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });

    //make admin
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await userCollection.updateOne(query, updateDoc);
      console.log(result);
      res.json(result);
    });

    //checking admin
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    //status update
    app.put("/statusUpdate/:id", async (req, res) => {
      const filter = { _id: ObjectId(req.params.id) };
      console.log(req.params.id);
      const result = await ordersCollection.updateOne(filter, {
        $set: {
          status: req.body.status,
        },
      });
      res.send(result);
      console.log(result);
    });

    //delete
    app.delete("/orders/:id", async (req, res) => {
      const query = { _id: ObjectId(req.params.id) };
      console.log(query);
      const result = await ordersCollection.deleteOne(query);
      res.json(result);
    });

    //review
    app.get("/getReviews", async (req, res) => {
      const reviews = reviewCollection.find({});
      const result = await reviews.toArray();
      res.json(result);
    });
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server Running");
});

app.listen(port, () => {
  console.log("Server is running on port", port);
});
