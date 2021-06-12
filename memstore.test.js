/* eslint-disable no-undef */
/* eslint-disable import/extensions */
import KVStore from './memstore.js';

describe('getting non existence key should fail', () => {
  const s = new KVStore();
  test('getting non existence key should fail with error', () => {
    expect.assertions(1);
    return expect(s.getValue('key1')).rejects.toThrow('key not found');
  });
  test('getting non existence key with any timestamp should fail with error', () => {
    expect.assertions(1);
    return expect(s.getValue('key1', 1600000000)).rejects.toThrow('no value found before provided timestamp');
  });
});

describe('getting with non-string key should fail', () => {
  const s = new KVStore();
  test('getting with number key should fail with error', () => {
    expect.assertions(1);
    return expect(s.getValue(1)).rejects.toThrow('key is not string');
  });
  test('getting with number key should fail with error', () => {
    expect.assertions(1);
    return expect(s.getValue({ key: 'key' })).rejects.toThrow('key is not string');
  });
  test('getting with number key should fail with error', () => {
    expect.assertions(1);
    return expect(s.getValue(null)).rejects.toThrow('key is not string');
  });
  test('getting with number key should fail with error', () => {
    expect.assertions(1);
    return expect(s.getValue(undefined)).rejects.toThrow('key is not string');
  });
  test('getting with number key should fail with error', () => {
    expect.assertions(1);
    return expect(s.getValue([1, 2])).rejects.toThrow('key is not string');
  });
});

describe('setting with non-string key should fail', () => {
  const s = new KVStore();
  test('setting with number key should fail with error', () => {
    expect.assertions(1);
    return expect(s.setValue(1, 'v')).rejects.toThrow('key is not string');
  });
  test('setting with number key should fail with error', () => {
    expect.assertions(1);
    return expect(s.setValue({ key: 'key' }, 'v')).rejects.toThrow('key is not string');
  });
  test('setting with number key should fail with error', () => {
    expect.assertions(1);
    return expect(s.setValue(null, 'v')).rejects.toThrow('key is not string');
  });
  test('setting with number key should fail with error', () => {
    expect.assertions(1);
    return expect(s.setValue(undefined, 'v')).rejects.toThrow('key is not string');
  });
  test('setting with number key should fail with error', () => {
    expect.assertions(1);
    return expect(s.setValue([1, 2], 'v')).rejects.toThrow('key is not string');
  });
});

describe('getting with invalid timestamp should fail', () => {
  const s = new KVStore();
  test('getting with a invalid timestamp should fail with error', () => {
    expect.assertions(1);
    return expect(s.getValue('key1', 'abc')).rejects.toThrow('invalid timestamp');
  });
});

describe('setting value should return same key and value with timestamp', () => {
  test('key and value returned should be same as input', () => {
    const s = new KVStore();
    expect.assertions(2);
    return s.setValue('key1', 'val1').then((data) => {
      expect(data.key).toBe('key1');
      expect(data.value).toBe('val1');
    });
  });
  test('should return with valid timestamp', () => {
    const s = new KVStore();
    expect.assertions(3);
    return s.setValue('key1', 'val1').then((data) => {
      expect(data.timestamp).toBeDefined();
      expect(data.timestamp).toBeGreaterThanOrEqual(1000000000);
      expect(data.timestamp).toBeLessThanOrEqual(9999999999);
    });
  });
});

describe('timestamp difference between 2 setValue calls should be equal to time elapsed', () => {
  jest.useFakeTimers();
  test('', () => {
    const s = new KVStore();
    let t1;
    let t2;
    expect.assertions(5);
    return s.setValue('key1', 'val1').then((data) => {
      expect(data.key).toBe('key1');
      expect(data.value).toBe('val1');
      t1 = data.timestamp;
    }).then(() => {
      jest.advanceTimersByTime(7000);
      return s.setValue('key1', 'val2');
    }).then((data) => {
      expect(data.key).toBe('key1');
      expect(data.value).toBe('val2');
      t2 = data.timestamp;
      expect(t2 - t1).toBe(7);
    });
  });
});

describe('getValue with timestamp should return correct values', () => {
  jest.useFakeTimers();
  test('', () => {
    const s = new KVStore();
    let t1;
    let t2;
    expect.assertions(6);
    return s.setValue('key1', 'val1')
      .then((data) => {
        t1 = data.timestamp;
        jest.advanceTimersByTime(7000);
        return s.setValue('key1', 'val2');
      })
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
