const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000

app.use(cors({
  origin: [
    'http://localhost:5173', 'http://localhost:5174'
  ],
  credentials: true,
}))
app.use(express.json())

const uri = `mongodb+srv://${process.env.USER_ID}:${process.env.USER_PASS}@cluster0.uoehazd.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();

    const mealsItem = client.db("HostelDB").collection("meals");
    const users = client.db("HostelDB").collection("users");
    const memberShip = client.db("HostelDB").collection("memberShip");



    // admin rode 

    const verifyAdmin = async (req, res, next) => {
      const user = req.user
      console.log('user from verify admin', user)
      // const query = { email: user?.email }
      // const result = await users.findOne(query)
      // if (!result || result?.role !== 'admin')
      //   return res.status(401).send({ message: 'unauthorized access' })
      next()
    }


    // // meals
    // app.get('/meals', async (req, res) => {
    //   const result = await meals.find().toArray()
    //   res.send(result)
    // })

    // mealItem

    app.get('/mealItem', async (req, res) => {
      const result = await mealsItem.find().toArray()
      res.send(result)
    })

    app.get('/mealItem/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await mealsItem.findOne(query)
      res.send(result)
    })

    app.post('/mealItem', async(req, res) => {
      const meals = req.body
      const result = await mealsItem.insertOne(meals)
      res.send(result)
    })

    app.get('/mealsCategory', async (req, res) => {
      const search = req.query.search
      const query = { category: search }
      const result = await mealsItem.find(query).toArray()
      res.send(result)
    })


    // user
    app.get('/users',verifyAdmin, async (req, res) => {
      const result = await users.find().toArray()
      res.send(result)
    })

    app.get('/user/:email', async (req, res) => {
      const email = req.params.email
      const result = await users.findOne({ email })
      res.send(result)
    })

    app.post('/users', async (req, res) => {
      const user = req.body
      const query = { email: user.email }
      const existingUser = await users.findOne(query)
      if (existingUser) {
        return res.send({ message: 'user already exists', insertedId: null })
      }
      const result = await users.insertOne(user)
      res.send(result)
    })

    app.patch(`/users/:id`,async(req,res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const bodyData = req?.body
      const update = {
        $set: {
          role: bodyData?.role ,
        }
      }
      const result = await users.updateOne(query, update, options)
      res.send(result)
    })

    // memberShip

    app.get('/memberShip', async (req, res) => {
      const result = await memberShip.find().toArray()
      res.send(result)
    })

    app.get('/memberShip/:name', async (req, res) => {
      const name = req.params.name
      const query = { name: name }
      const result = await memberShip.findOne(query)
      res.send(result)
    })

    app.get('/mealItem/:id', async (req, res) => {
     
    })


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally { }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})