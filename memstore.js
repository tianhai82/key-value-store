/* eslint-disable import/extensions */
import isValidTimestamp from './isValidTimestamp.js';

export default class KVStore {
  constructor() {
    this.store = {};
  }

  setValue(key, value) {
    const now = new Date();
    const timestamp = Math.round(now.getTime() / 1000);
    if (typeof key === 'string') {
      const obj = {
        value,
        timestamp,
      };
      if (this.store[key]) {
        const tempArray = this.store[key];
        tempArray.unshift(obj);
        this.store[key] = tempArray;
      } else {
        this.store[key] = [obj];
      }
      return Promise.resolve({ ...obj, key });
    }
    return Promise.reject(new Error('key is not string'));
  }

  getValue(key, timestamp) {
    if (typeof key !== 'string') {
      return Promise.reject(new Error('key is not string'));
    }
    if (timestamp == null) {
      if (!this.store[key]) {
        return Promise.reject(new Error('key not found'));
      }
      return Promise.resolve({ value: this.store[key][0].value });
    }
    if (!isValidTimestamp(timestamp)) {
      return Promise.reject(new Error('invalid timestamp'));
    }
    if (!this.store[key]) {
      return Promise.reject(new Error('no value found before provided timestamp'));
    }
    for (let i = 0; i < this.store[key].length; i += 1) {
      const obj = this.store[key][i];
      if (obj.timestamp <= timestamp) {
        return Promise.resolve({ value: obj.value });
      }
    }
    return Promise.reject(new Error('no value found before provided timestamp'));
  }
}
