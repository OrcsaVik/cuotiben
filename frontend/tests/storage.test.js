const storage = require('../services/storage');

beforeEach(() => {
  global.__resetWx();
});

test('读不存在的 key 返回传入的兜底值，不抛异常', () => {
  expect(storage.get('nope', null)).toBeNull();
  expect(storage.get('nope', [])).toEqual([]);
});

test('写入的对象能原样读回', () => {
  const value = { id: 'm1', tags: ['期中考'], nested: { n: 1 } };
  storage.set('mistakes', value);
  expect(storage.get('mistakes', null)).toEqual(value);
});

test('写入的数组能原样读回', () => {
  storage.set('list', [1, 2, 3]);
  expect(storage.get('list', [])).toEqual([1, 2, 3]);
});

test('底层存储内容被破坏时返回兜底值而非抛异常', () => {
  wx.setStorageSync('mb:broken', '{ 不是合法 JSON');
  expect(storage.get('broken', 'fallback')).toBe('fallback');
});

test('key 带统一前缀，不与小程序内其他存储冲突', () => {
  storage.set('mistakes', []);
  expect(global.__wxStore.has('mb:mistakes')).toBe(true);
  expect(global.__wxStore.has('mistakes')).toBe(false);
});

test('remove 只删指定 key', () => {
  storage.set('a', 1);
  storage.set('b', 2);
  storage.remove('a');
  expect(storage.get('a', null)).toBeNull();
  expect(storage.get('b', null)).toBe(2);
});

test('keys 只列出本项目前缀下的 key，且不含前缀', () => {
  storage.set('a', 1);
  storage.set('b', 2);
  wx.setStorageSync('other:key', 'x');
  expect(storage.keys().sort()).toEqual(['a', 'b']);
});

test('clear 清空本项目数据，不动其他来源的 key', () => {
  storage.set('a', 1);
  wx.setStorageSync('other:key', 'x');
  storage.clear();
  expect(storage.get('a', null)).toBeNull();
  expect(wx.getStorageSync('other:key')).toBe('x');
});

test('has 能判断是否已初始化过数据', () => {
  expect(storage.has('seeded')).toBe(false);
  storage.set('seeded', true);
  expect(storage.has('seeded')).toBe(true);
});
