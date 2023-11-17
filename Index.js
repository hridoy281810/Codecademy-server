const express = require('express');
const app = express()
const cors = require('cors')
var jwt = require('jsonwebtoken');
require('dotenv').config()
const port = process.env.PORT || 5000


app.use(cors())
app.use(express.json())

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.x6iur0l.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
const varifyJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).send({ error: true, message: "unauthorized access request 1" })
  }

  else {
    jwt.verify(token, process.env.secret_key, (err, decoded) => {
      if (err) {
        res.status(401).send({ error: true, message: 'unauthorized access request 2' })
      }
      req.decoded = decoded
      next()
    })
  }
}
async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const database = client.db("Codecademy");
        const courseCollection = database.collection('course')
        const userCollection = database.collection("users");

        // user data 
        app.post('/jwt', async (req, res) => {
          const user = req.body
          const token = jwt.sign(user, process.env.secret_key, { expiresIn: '1d' })
          res.send({ token })
        })
           // Get single user by email
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      res.send(user);
    });
 
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "account already exist" });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });
            // all classes page api 
    app.get('/all-course', async (req, res) => {
        const result = await courseCollection.find().toArray()
        res.send(result)
      })
      
    app.get("/course/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await courseCollection.findOne(query);
      res.send(result);
    });
        // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Server is running now')
  })
  
  app.listen(port, () => {
    console.log(`Server is running on port: ${port}`)
  })