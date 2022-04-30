const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware 

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.aofkw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        client.connect();
        const itemCollection = client.db('agronomy').collection('items');

        app.get('/item', async (req, res) => {
            const query = {};
            const cursor = itemCollection.find(query).limit(6);
            const items = await cursor.toArray();
            res.send(items);
        });

        app.get('/item/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const item = await itemCollection.findOne(query);
            res.send(item);
        });

        app.get('/items', async (req, res) => {
            const query = {};
            const cursor = itemCollection.find(query);
            const items = await cursor.toArray();
            res.send(items);
        });

        app.put('/item/:id', async (req, res)=>{
            const id = req.params.id;
            const quantity = req.body.quantity;
            const filter = {_id: ObjectId(id)};
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    quantity: quantity
                },
            };
            const result = await itemCollection.updateOne(filter, updateDoc, options);
            res.send({message: "Delivered"});
        })

        // myitem er jonno client side e design implement korinai 
        app.get('/myItem', async (req, res) => {
            const email = req.query.email;
            console.log(email);
            const query = { email: email };
            const cursor = itemCollection.find(query);
            const items = await cursor.toArray();
            res.send(items);
        });

        app.post('/item', async (req, res) => {
            console.log(req.body.quantity);
            if (req.body.quantity > 20) {
                res.send({ success: false, message: "You Can't Add more than 20 Item at a time" });
                return;
            }
            const item = req.body;
            const result = await itemCollection.insertOne(item);
            res.send({ success: true, message: "Item Added" });
        });

        app.delete('/item/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await itemCollection.deleteOne(query);
            res.send({ message: 'Item deleted' });
        });
    }
    finally { }
};

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Server connected');
});

app.listen(port, () => console.log('listening to port,', port));