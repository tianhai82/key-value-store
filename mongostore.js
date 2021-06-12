/* eslint-disable import/extensions */
import pkg from 'mongodb';
import isValidTimestamp from './isValidTimestamp.js';

const { MongoClient } = pkg;

export default class MongoKVStore {
  constructor(userID, password, server, db, col) {
    const uri = `mongodb+srv://${userID}:${password}@${server}/${db}?retryWrites=true&w=majority`;
    this.client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    this.colName = col;
  }

  connect() {
    return this.client.connect()
      .then(() => {
        this.col = this.client.db('db').collection(this.colName);
      })
      .catch((err) => {
        throw err;
      });
  }

  disconnect() {
    return this.client.close();
  }

  setValue(key, value) {
    const now = new Date();
    const timestamp = Math.round(now.getTime() / 1000);
    if (typeof key === 'string') {
      const obj = {
        key,
        value,
        timestamp,
      };
      return this.col.insertOne({ ...obj })
        .then((result) => {
          if (result.insertedCount !== 1) {
            throw new Error('fail to save record');
          }
          return obj;
        });
    }
    return Promise.reject(new Error('key is not string'));
  }

  getValue(key, timestamp) {
    if (typeof key !== 'string') {
      return Promise.reject(new Error('key is not string'));
    }
    if (timestamp == null) {
      return this.col.findOne({ key }, {
        sort: { timestamp: -1 },
        projection: {
          value: 1,
          _id: 0,
        },
      }).then((result) => {
        if (result == null) {
          throw new Error('key not found');
        }
        return result;
      });
    }

    if (!isValidTimestamp(timestamp)) {
      return Promise.reject(new Error('invalid timestamp'));
    }
    return this.col.findOne({
      key,
      timestamp: {
        $lte: timestamp,
      },
    }, {
      sort: { timestamp: -1 },
      projection: {
        value: 1,
        _id: 0,
      },
    }).then((result) => {
      if (result == null) {
        throw new Error('no value found before provided timestamp');
      }
      return result;
    });
  }

  clearStore() {
    return this.col.drop().catch((err) => console.log(err));
  }
}
