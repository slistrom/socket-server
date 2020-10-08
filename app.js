// MongoDB
const mongo = require("mongodb").MongoClient;
const dsn =  "mongodb://localhost:27017/chatlog";

// Express
const express = require('express');
const app = express();
const port = 8000;
const bodyParser = require('body-parser');

const cors = require('cors');

app.use(cors());
app.use(bodyParser.json());

const server = require('http').createServer(app);
const io = require('socket.io')(server);


// Return a JSON object with list of all documents within the collection.
app.get("/chatlog", async (request, response) => {
    try {
        let res = await findInCollection(dsn, "messages", {}, {}, 0);

        // console.log(res);
        response.json(res);
    } catch (err) {
        console.log(err);
        response.json(err);
    }
});

/**
 * Reset a collection by removing existing content and insert a default
 * set of documents.
 *
 * @async
 *
 * @param {string} dsn     DSN to connect to database.
 * @param {string} colName Name of collection.
 * @param {string} doc     Documents to be inserted into collection.
 *
 * @throws Error when database operation fails.
 *
 * @return {Promise<void>} Void
 */
async function updateChatlog(dsn, colName, doc) {
    const client  = await mongo.connect(dsn, { useUnifiedTopology: true });
    const db = await client.db();
    const col = await db.collection(colName);

    await col.insertOne(doc);

    await client.close();
}

/**
 * Find documents in an collection by matching search criteria.
 *
 * @async
 *
 * @param {string} dsn        DSN to connect to database.
 * @param {string} colName    Name of collection.
 * @param {object} criteria   Search criteria.
 * @param {object} projection What to project in results.
 * @param {number} limit      Limit the number of documents to retrieve.
 *
 * @throws Error when database operation fails.
 *
 * @return {Promise<array>} The resultset as an array.
 */
async function findInCollection(dsn, colName, criteria, projection, limit) {
    const client  = await mongo.connect(dsn, { useUnifiedTopology: true });
    const db = await client.db();
    const col = await db.collection(colName);
    const res = await col.find(criteria, projection).limit(limit).toArray();

    await client.close();

    return res;
}


io.origins(['https://listrom.me:443','http://localhost:3000']);

io.on('connection', function (socket) {
    console.info("User connected");

    socket.on('chat message', function (message) {
        const timestamp = new Date().toLocaleTimeString();
        const stampedMessage = timestamp + " - " + message;
        io.emit('chat message', stampedMessage);
        updateChatlog(dsn, "messages", { message: stampedMessage })
            .catch(err => console.log(err));
    });
});

server.listen(port, () => {
    console.log(`Socket server listening on port ${port}!`);
    console.log(`DSN is: ${dsn}`);
});
