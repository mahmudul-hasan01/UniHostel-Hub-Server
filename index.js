const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const stripe = require('stripe')(process.env.Stripe_Secret_key)
const port = process.env.PORT || 5000

app.use(cors({
  origin: [
    'http://localhost:5173', 
    // 'https://unihostel-hub.firebaseapp.com'
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
    const upcoming = client.db("HostelDB").collection("upcoming");
    const users = client.db("HostelDB").collection("users");
    const memberShip = client.db("HostelDB").collection("memberShip");
    const mealRequest = client.db("HostelDB").collection("mealRequest");



    // admin rode 

    // const verifyAdmin = async (req, res, next) => {
    //   const user = req.user
    //   console.log('user from verify admin', user)
      // const query = { email: user?.email }
      // const result = await users.findOne(query)
      // if (!result || result?.role !== 'admin')
      //   return res.status(401).send({ message: 'unauthorized access' })
    //   next()
    // }


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

    app.get('/mealsCategory', async (req, res) => {
      const search = req.query.search
      console.log(search);
      const query = { 
        category: {$regex: search, $options: 'i'}
       }
      const result = await mealsItem.find(query).toArray()
      res.send(result)
    })

    app.post('/mealItem', async (req, res) => {
      const meals = req.body
      const result = await mealsItem.insertOne(meals)
      res.send(result)
    })

    app.delete('/mealItem/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await mealsItem.deleteOne(query)
      res.send(result)
    })

    app.put('/manageItem/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const data = req.body
      const update = {
        $set: {

          name: data.name,
          category: data.category,
          ingredients: data?.ingredients,
          rating: data.rating,
          time: data.time,
          like: data.like,
          reviews: data.reviews,
          price: data.price,
          description: data.description,
          image: data.image,

        }
      }
      const result = await mealsItem.updateOne(query, update, options)
      res.send(result)
    })

    app.patch(`/likeUpdate/:id`, async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const bodyData = req?.body
      const update = {
        $set: {
          like: bodyData?.like
        }
      }
      const result = await mealsItem.updateOne(query, update, options)
      res.send(result)
    })

    // Meal request

    app.get('/mealRequest', async (req, res) => {
      const result = await mealRequest.find().toArray()
      res.send(result)
    })

    app.post('/mealRequest', async (req, res) => {
      const meals = req.body
      const result = await mealRequest.insertOne(meals)
      res.send(result)
    })

    app.delete('/mealRequest/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await mealRequest.deleteOne(query)
      res.send(result)
    })

    // 
    
    app.get('/upcoming', async (req, res) => {
      const result = await upcoming.find().toArray()
      res.send(result)
    })

    app.get('/upcomings', async (req, res) => {
      const query = {}
      const options = {
        sort: {
          like: -1
        }
      }
      // console.log(query,options);
      const result = await upcoming.find(query, options).toArray()
      res.send(result)
    })

    app.post('/upcoming', async (req, res) => {
      const meals = req.body
      const result = await upcoming.insertOne(meals)
      res.send(result)
    })

    // user
    app.get('/users',  async (req, res) => {
      const result = await users.find().toArray()
      res.send(result)
    })

    app.get('/user/:email', async (req, res) => {
      const email = req.params.email
      const query = { email: email }
      const result = await users.findOne(query)
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

    app.patch(`/users/:id`, async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const bodyData = req?.body
      const update = {
        $set: {
          role: bodyData?.role,
          // status: bodyData?.status,
        }
      }
      const result = await users.updateOne(query, update, options)
      res.send(result)
    })
    app.patch(`/usersStatus/:email`, async (req, res) => {
      const email = req.params.email
      const query = { email: email }
      const options = { upsert: true };
      const bodyData = req?.body
      const update = {
        $set: {
          status: bodyData?.status,
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

    // payment

    app.post('/payment-intent', async (req, res) => {
      const { price } = req.body
      const amount = parseInt(price * 100)
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ['card']
      })
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
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