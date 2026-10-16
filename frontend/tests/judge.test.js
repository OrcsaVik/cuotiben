const { normalize, judge } = require('../utils/judge');

test('normalize 把全角转半角并去掉所有空格', () => {
  expect(normalize('１／２')).toBe('1/2');
  expect(normalize('  a b  ')).toBe('ab');
});

test('单选：与标准答案一致判对', () => {
  expect(judge('单选', 'B', 'B')).toBe(true);
});

test('单选：与标准答案不一致判错', () => {
  expect(judge('单选', 'C', 'B')).toBe(false);
});

test('判断：对/错二选一，一致判对', () => {
  expect(judge('判断', '对', '对')).toBe(true);
  expect(judge('判断', '错', '对')).toBe(false);
});

test('多选：选项顺序不同但全集一致判对', () => {
  expect(judge('多选', 'CBA', 'ABC')).toBe(true);
});

test('多选：少选判错，不给部分分', () => {
  expect(judge('多选', 'AC', 'ABC')).toBe(false);
});

test('多选：多选判错，不给部分分', () => {
  expect(judge('多选', 'ABCD', 'ABC')).toBe(false);
});

test('多选：错选判错', () => {
  expect(judge('多选', 'ABD', 'ABC')).toBe(false);
});

test('多选：作答为选项数组时同样判对', () => {
  expect(judge('多选', ['A', 'B', 'C'], 'ABC')).toBe(true);
});

test('填空：双方归一化后比对，空格与全角不影响判分', () => {
  expect(judge('填空', '1 / 2', ['1/2'])).toBe(true);
  expect(judge('填空', '１／２', ['1/2'])).toBe(true);
});

test('填空：多空逐空比对，全部正确才判对', () => {
  expect(judge('填空', ['7', '8'], ['7', '8'])).toBe(true);
});

test('填空：任一空错误即判错', () => {
  expect(judge('填空', ['9', '8'], ['7', '8'])).toBe(false);
});

test('填空：空的个数不一致判错', () => {
  expect(judge('填空', ['7'], ['7', '8'])).toBe(false);
});
