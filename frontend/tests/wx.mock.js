const store = new Map();

global.wx = {
  getStorageSync: (key) => (store.has(key) ? store.get(key) : ''),
  setStorageSync: (key, value) => {
    store.set(key, value);
  },
  removeStorageSync: (key) => {
    store.delete(key);
  },
  clearStorageSync: () => {
    store.clear();
  },
  getStorageInfoSync: () => ({ keys: [...store.keys()] }),
};

global.__wxStore = store;
global.__resetWx = () => store.clear();
