const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qchtg.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const partCollection = client.db('car_manufacturer').collection('parts');
        const reviewCollection = client.db('car_manufacturer').collection('reviews');
        const socialCollection = client.db('car_manufacturer').collection('social');

        // get part data from mongodb
        app.get('/part', async (req, res) => {
            const query = {};
            const cursor = partCollection.find(query);
            const parts = await cursor.toArray();
            res.send(parts);
        })

        // Get single part data
        app.get('/part/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await partCollection.findOne(query);
            res.send(service);
        })

        // get review from mongodb
        app.get('/review', async (req, res) => {
            const query = {};
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        })

        // Post review in database
        app.post('/review', async (req, res) => {
            const newReview = req.body;
            const result = await reviewCollection.insertOne(newReview)
            res.send(result)
        })

        // Post social info in database
        app.post('/profile', async (req, res) => {
            const socialInfo = req.body;
            const result = await socialCollection.insertOne(socialInfo)
            res.send(result)
        })

        // Put part quantity
        app.put('/part/:id', async (req, res) => {
            const id = req.params.id;
            const updatedStock = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    order_quantity: updatedStock.totalQuantity,
                }
            };
            const result = await partCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })
    }
    finally {

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Welcome to your parts manufacture!')
})

app.listen(port, () => {
    console.log(`Port is runninng successfully', ${port}`)
})