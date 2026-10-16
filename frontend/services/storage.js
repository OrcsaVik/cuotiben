const PREFIX = 'mb:';

function read(key) {
  const raw = wx.getStorageSync(PREFIX + key);
  if (raw === '' || raw === undefined || raw === null) return undefined;
  try {
    return JSON.parse(raw);
  } catch (err) {
    return undefined;
  }
}

function get(key, fallback) {
  const value = read(key);
  return value === undefined ? fallback : value;
}

function set(key, value) {
  wx.setStorageSync(PREFIX + key, JSON.stringify(value));
}

function remove(key) {
  wx.removeStorageSync(PREFIX + key);
}

function has(key) {
  return read(key) !== undefined;
}

function keys() {
  return wx
    .getStorageInfoSync()
    .keys.filter((key) => key.indexOf(PREFIX) === 0)
    .map((key) => key.slice(PREFIX.length));
}

function clear() {
  keys().forEach(remove);
}

module.exports = { get, set, remove, has, keys, clear };
