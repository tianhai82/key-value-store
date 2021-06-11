import pkg from 'mongodb';

const { MongoClient } = pkg;
const userID = 'admin';
const password = 'nza7ag1FM2zAHmIm';
const server = 'cluster0.o1bjr.mongodb.net';
const db = 'db';
const uri = `mongodb+srv://${userID}:${password}@${server}/${db}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let col;
client.connect(() => {
  col = client.db('db').collection('key_value');
});

export function setValue(key, value) {
  const now = new Date();
  const timestamp = Math.round(now.getTime() / 1000);
  if (typeof key === 'string') {
    const obj = {
      key,
      value,
      timestamp,
    };
    return col.insertOne({ ...obj })
      .then((result) => {
        if (result.insertedCount !== 1) {
          throw new Error('fail to save record');
        }
        return obj;
      });
  }
  return Promise.reject(new Error('key is not string'));
}

export async function getValue(key, timestamp) {
  if (!timestamp) {
    return col.findOne({ key }, {
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

  return col.findOne({
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
