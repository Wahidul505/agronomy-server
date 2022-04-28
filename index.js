const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware 

app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.aofkw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        client.connect();
        const itemCollection = client.db('agronomy').collection('items');

        app.get('/items', async (req, res) => {
            const query = {};
            const cursor = itemCollection.find(query).limit(6);
            const items = await cursor.toArray();
            res.send(items);
        })
    }
    finally { }
};

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Server connected');
});

app.listen(port, () => console.log('listening to port,', port));