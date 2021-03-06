const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;

// middleware 

app.use(cors());
app.use(express.json());
app.use(
    cors({
      origin: "*",
    })
  );


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.aofkw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        client.connect();
        const itemCollection = client.db('agronomy').collection('items');

        // getting maximum 6 items to display in home page 
        app.get('/item', async (req, res) => {
            const query = {};
            const cursor = itemCollection.find(query).limit(6);
            const items = await cursor.toArray();
            res.send(items);
        });

        // getting item by their id 
        app.get('/item/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const item = await itemCollection.findOne(query);
            res.send(item);
        });

        // getting all items 
        app.get('/items', async (req, res) => {
            const page = parseInt(req.query.page);
            const number = parseInt(req.query.limit);
            const query = {};
            const cursor = itemCollection.find(query).skip(page * number).limit(number);
            const items = await cursor.toArray();
            res.send(items);
        });

        app.get('/all-items', async (req, res) => {
            const items = await itemCollection.find().sort({ name: 1 }).toArray();
            res.send(items);
        })

        // updating an item 
        app.put('/item/:id', async (req, res) => {
            const id = req.params.id;
            const quantity = req.body.quantity;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    quantity: quantity
                },
            };
            const result = await itemCollection.updateOne(filter, updateDoc, options);
            res.send({ message: "Delivered" });
        })

        // getting item by a particular email and using jwt verification 
        app.get('/myItem', async (req, res) => {
            const email = req.query.email;
            const token = req.query.token;
            if (!token) {
                res.send({ success: false, message: 'UnAuthorized User' })
            }
            jwt.verify(token, process.env.ACCESS_TOKEN, async (err, decoded) => {
                if (err) {
                    res.send({ success: false, message: 'UnAuthorized User' })
                }
                else if (decoded) {
                    const query = { email: email };
                    const cursor = itemCollection.find(query);
                    const items = await cursor.toArray();
                    res.send({ success: true, data: items });
                }
            })
        });

        // adding item to database 
        app.post('/item', async (req, res) => {
            if (req.body.quantity > 50) {
                res.send({ success: false, message: "You Can't Add more than 50 Item at a time" });
                return;
            }
            const item = req.body;
            const result = await itemCollection.insertOne(item);
            res.send({ success: true, message: "Item Added" });
        });

        // deleting item by their id 
        app.delete('/item/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await itemCollection.deleteOne(query);
            res.send({ message: 'Item deleted' });
        });

        // counting total items in database 
        app.get('/itemCount', async (req, res) => {
            const count = await itemCollection.countDocuments();
            res.send({ count: count });
        });

        // getting items with highest quantity 
        app.get('/sortedItemByQuantity', async (req, res) => {
            const query = {};
            const cursor = itemCollection.find(query).sort({ quantity: -1 }).limit(3);
            const sortedItems = await cursor.toArray();
            res.send(sortedItems);
        });

        // getting item with the highest price 
        app.get('/highestPriceItem', async (req, res) => {
            const query = {};
            const cursor = itemCollection.find(query).sort({ price: -1 }).limit(1);
            const highestPriceItem = await cursor.toArray();
            res.send(highestPriceItem);
        });

        // sending access token to the client 
        app.post('/access', async (req, res) => {
            const email = req.body.email;
            const token = jwt.sign(email, process.env.ACCESS_TOKEN);
            res.send({ token: token });
        })
    }
    finally { }
};

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Agronomy Server Connected');
});


// port where the server runs 
app.listen(port, () => console.log('listening to port,', port));