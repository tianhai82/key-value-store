/* eslint-disable import/extensions */
import express from 'express';
import MongoKVStore from './mongostore.js';
// import KVStore from './memstore.js';

const app = express();
const port = 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const userID = process.env.DB_USER_ID;
const password = process.env.DB_PASSWORD;
const server = process.env.DB_CLUSTER;
const db = process.env.DB;
const col = process.env.DB_COL;
const store = new MongoKVStore(userID, password, server, db, col);
store.connect();
// const store = new KVStore();

app.get('/object/:key', async (req, res) => {
  const { timestamp } = req.query;
  const { params } = req;

  store.getValue(params.key, +timestamp).then((obj) => {
    res.json(obj);
  }).catch((e) => {
    // log request error
    console.log(`failed to retrieve key: ${params.key}, timestamp: ${+timestamp}. error: ${e.message}`);
    res.sendStatus(404);
  });
});

app.post('/object', (req, res) => {
  const { body } = req;
  if (!body || Array.isArray(body) || typeof body !== 'object') {
    res.sendStatus(400);
    return;
  }
  const keys = Object.keys(body);
  if (keys.length !== 1) {
    res.sendStatus(400);
    return;
  }

  store.setValue(keys[0], body[keys[0]])
    .then((out) => {
      res.json(out);
    }).catch((e) => {
      // log error inserting
      console.log(`failed to insert key: ${keys[0]}. error: ${e.message}`);
      res.status(500).send('failed to insert data.');
    });
});

app.use((req, res) => {
  res.status(404).send({ message: 'Not Found' });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
