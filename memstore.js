let store = {};

export function setValue(key, value) {
  const now = new Date();
  const timestamp = Math.round(now.getTime() / 1000);
  if (typeof key === 'string') {
    const obj = {
      value,
      timestamp,
    };
    if (store[key]) {
      const tempArray = store[key];
      tempArray.unshift(obj);
      store[key] = tempArray;
    } else {
      store[key] = [obj];
    }
    return Promise.resolve({ ...obj, key });
  }
  return Promise.reject(new Error('key is not string'));
}

export function getValue(key, timestamp) {
  if (!store[key]) {
    return Promise.reject(new Error('key not found'));
  }
  if (!timestamp) {
    return Promise.resolve({ value: store[key][0].value });
  }
  for (let i = 0; i < store[key].length; i += 1) {
    const obj = store[key][i];
    if (obj.timestamp <= timestamp) {
      return Promise.resolve({ value: obj.value });
    }
  }
  return Promise.reject(new Error('no value found before provided timestamp'));
}

export function reset() {
  store = {};
}
