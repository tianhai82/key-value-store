/* eslint-disable no-undef */
/* eslint-disable import/extensions */
import MongoKVStore from './mongostore.js';

require('dotenv').config();

const userID = process.env.DB_USER_ID;
const password = process.env.DB_PASSWORD;
const server = process.env.DB_CLUSTER;
const db = process.env.DB;
// const col = 'key_value';

function later(delay) {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}

describe('getValue non existence key should fail', () => {
  const s = new MongoKVStore(userID, password, server, db, 'store1');
  beforeAll(() => s.connect().then(() => s.clearStore()));
  afterAll(() => s.clearStore().then(() => s.disconnect()));

  test('getValue non existence key should fail with error', () => {
    expect.assertions(1);
    return expect(s.getValue('key1')).rejects.toThrow('key not found');
  });
  test('getValue non existence key with any timestamp should fail with error', () => {
    expect.assertions(1);
    return expect(s.getValue('key1', 1600000000))
      .rejects.toThrow('no value found before provided timestamp');
  });
});

describe('getValue with non-string key should fail', () => {
  const s = new MongoKVStore(userID, password, server, db, 'store2');
  beforeAll(() => s.connect().then(() => s.clearStore()));
  afterAll(() => s.clearStore().then(() => s.disconnect()));

  test('getValue with number key should fail with error', () => {
    expect.assertions(1);
    return expect(s.getValue(1)).rejects.toThrow('key is not string');
  });
  test('getValue with number key should fail with error', () => {
    expect.assertions(1);
    return expect(s.getValue({ key: 'key' })).rejects.toThrow('key is not string');
  });
  test('getValue with number key should fail with error', () => {
    expect.assertions(1);
    return expect(s.getValue(null)).rejects.toThrow('key is not string');
  });
  test('getValue with number key should fail with error', () => {
    expect.assertions(1);
    return expect(s.getValue(undefined)).rejects.toThrow('key is not string');
  });
  test('getValue with number key should fail with error', () => {
    expect.assertions(1);
    return expect(s.getValue([1, 2])).rejects.toThrow('key is not string');
  });
});

describe('setValue with non-string key should fail', () => {
  const s = new MongoKVStore(userID, password, server, db, 'store3');
  beforeAll(() => s.connect().then(() => s.clearStore()));
  afterAll(() => s.clearStore().then(() => s.disconnect()));

  test('setValue with number key should fail with error', () => {
    expect.assertions(1);
    return expect(s.setValue(1, 'v')).rejects.toThrow('key is not string');
  });
  test('setValue with object key should fail with error', () => {
    expect.assertions(1);
    return expect(s.setValue({ key: 'key' }, 'v')).rejects.toThrow('key is not string');
  });
  test('setValue with null key should fail with error', () => {
    expect.assertions(1);
    return expect(s.setValue(null, 'v')).rejects.toThrow('key is not string');
  });
  test('setValue with undefined key should fail with error', () => {
    expect.assertions(1);
    return expect(s.setValue(undefined, 'v')).rejects.toThrow('key is not string');
  });
  test('setValue with array key should fail with error', () => {
    expect.assertions(1);
    return expect(s.setValue([1, 2], 'v')).rejects.toThrow('key is not string');
  });
});

describe('getValue with invalid timestamp should fail', () => {
  const s = new MongoKVStore(userID, password, server, db, 'store4');
  beforeAll(() => s.connect().then(() => s.clearStore()));
  afterAll(() => s.clearStore().then(() => s.disconnect()));

  test('getValue with a string timestamp should fail with error', () => {
    expect.assertions(1);
    return expect(s.getValue('key1', 'abc')).rejects.toThrow('invalid timestamp');
  });
  test('getValue with a invalid timestamp should fail with error', () => {
    expect.assertions(1);
    return expect(s.getValue('key1', 160000050)).rejects.toThrow('invalid timestamp');
  });
  test('getValue with a object timestamp should fail with error', () => {
    expect.assertions(1);
    return expect(s.getValue('key1', { x: 1 })).rejects.toThrow('invalid timestamp');
  });
});

describe('setting value should return same key and value with timestamp', () => {
  const s = new MongoKVStore(userID, password, server, db, 'store5');
  beforeAll(() => s.connect().then(() => s.clearStore()));
  afterAll(() => s.clearStore().then(() => s.disconnect()));

  test('key and value returned should be same as input', () => {
    expect.assertions(2);
    return s.setValue('key1', 'val1').then((data) => {
      expect(data.key).toBe('key1');
      expect(data.value).toBe('val1');
    });
  });
  test('should return with valid timestamp', () => {
    expect.assertions(3);
    return s.setValue('key1', 'val1').then((data) => {
      expect(data.timestamp).toBeDefined();
      expect(data.timestamp).toBeGreaterThanOrEqual(1000000000);
      expect(data.timestamp).toBeLessThanOrEqual(9999999999);
    });
  });
});

describe('timestamp difference between 2 setValue calls should be equal to time elapsed', () => {
  const s = new MongoKVStore(userID, password, server, db, 'store6');
  beforeAll(() => s.connect().then(() => s.clearStore()));
  afterAll(() => s.clearStore().then(() => s.disconnect()));

  test('', () => {
    let t1;
    let t2;
    expect.assertions(1);
    return s.setValue('key1', 'val1').then((data) => {
      t1 = data.timestamp;
      return later(3000);
    })
      .then(() => s.setValue('key1', 'val2'))
      .then((data) => {
        t2 = data.timestamp;
        expect(t2 - t1).toBe(3);
      });
  });
});

describe('getValue with timestamp should return correct values', () => {
  jest.setTimeout(8000);
  const s = new MongoKVStore(userID, password, server, db, 'store7');
  beforeAll(() => s.connect().then(() => s.clearStore()));
  afterAll(() => s.clearStore().then(() => s.disconnect()));

  test('', () => {
    let t1;
    let t2;
    expect.assertions(6);
    return s.setValue('key1', 'val1')
      .then((data) => {
        t1 = data.timestamp;
        return later(7000);
      })
      .then(() => s.setValue('key1', 'val2'))
      .then((data) => {
        t2 = data.timestamp;
        return s.getValue('key1');
      })
      .then((data) => {
        expect(data.value).toBe('val2');
        return s.getValue('key1', t2);
      })
      .then((data) => {
        expect(data.value).toBe('val2');
        return s.getValue('key1', t2 + 1);
      })
      .then((data) => {
        expect(data.value).toBe('val2');
        return s.getValue('key1', t2 - 1);
      })
      .then((data) => {
        expect(data.value).toBe('val1');
        return s.getValue('key1', t1);
      })
      .then((data) => {
        expect(data.value).toBe('val1');
        return s.getValue('key1', t1 - 1);
      })
      .catch((err) => {
        expect(err.message).toBe('no value found before provided timestamp');
      });
  });
});
