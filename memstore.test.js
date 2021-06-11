/* eslint-disable no-undef */
/* eslint-disable import/extensions */
// const { getValue, setValue } = require('./memstore.js');
import { getValue, setValue, reset } from './memstore.js';

describe('getting non existence key should fail', () => {
  reset();
  test('getting non existence key should fail with error', () => {
    expect.assertions(1);
    return expect(getValue('key1')).rejects.toThrow('key not found');
  });
  test('getting non existence key with any timestamp should fail with error', () => {
    expect.assertions(1);
    return expect(getValue('key1', 1600000000)).rejects.toThrow('key not found');
  });
  test('getting non existence key with a invalid timestamp should fail with error', () => {
    expect.assertions(1);
    return expect(getValue('key1', 'abc')).rejects.toThrow('key not found');
  });
});

describe('setting value should return same key and value', () => {
  test('key and value returned should be same as input', () => {
    expect.assertions(2);
    return setValue('key1', 'val1').then((data) => {
      expect(data.key).toBe('key1');
      expect(data.value).toBe('val1');
    });
  });
});

describe('timestamp difference between 2 setValue calls should be equal to time elapsed', () => {
  jest.useFakeTimers();
  reset();
  test('', () => {
    let t1;
    let t2;
    expect.assertions(5);
    setValue('key1', 'val1').then((data) => {
      expect(data.key).toBe('key1');
      expect(data.value).toBe('val1');
      t1 = data.timestamp;
    });
    jest.advanceTimersByTime(7000);
    return setValue('key1', 'val2').then((data) => {
      expect(data.key).toBe('key1');
      expect(data.value).toBe('val2');
      t2 = data.timestamp;
      expect(t2 - t1).toBe(8);
    });
  });
});

describe('getValue with timestamp should return correct values', () => {
  jest.useFakeTimers();
  reset();
  test('', () => {
    let t1;
    let t2;
    expect.assertions(11);
    setValue('key1', 'val1').then((data) => {
      expect(data.key).toBe('key1');
      expect(data.value).toBe('val1');
      t1 = data.timestamp;
    });
    jest.advanceTimersByTime(7000);
    setValue('key1', 'val2').then((data) => {
      expect(data.key).toBe('key1');
      expect(data.value).toBe('val2');
      t2 = data.timestamp;
      expect(t2 - t1).toBe(7);
    });
    getValue('key1').then((data) => {
      expect(data.value).toBe('val2');
    });
    getValue('key1', t2).then((data) => {
      expect(data.value).toBe('val2');
    });
    getValue('key1', t2 + 1).then((data) => {
      expect(data.value).toBe('val2');
    });
    getValue('key1', t2 - 1).then((data) => {
      expect(data.value).toBe('val1');
    });
    getValue('key1', t1).then((data) => {
      expect(data.value).toBe('val1');
    });
    getValue('key1', t1 - 1).catch((err) => {
      expect(err.message).toBe('no value found before provided timestamp');
    });
  });
});
