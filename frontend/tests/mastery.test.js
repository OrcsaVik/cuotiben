const { computeMastery } = require('../utils/mastery');

const DAY = 24 * 60 * 60 * 1000;

function log(verdict, index) {
  return { verdict, createdAt: index * DAY };
}

test('0 条日志固定未掌握', () => {
  expect(computeMastery([])).toBe('未掌握');
});

test('最近 3 条全对判已掌握', () => {
  const logs = [log('做对了', 1), log('做对了', 2), log('做对了', 3)];
  expect(computeMastery(logs)).toBe('已掌握');
});

test('最近 3 条一对一错判部分掌握', () => {
  const logs = [log('做对了', 1), log('做错了', 2), log('做错了', 3)];
  expect(computeMastery(logs)).toBe('部分掌握');
});

test('最近 3 条全错判未掌握', () => {
  const logs = [log('做错了', 1), log('做错了', 2), log('做错了', 3)];
  expect(computeMastery(logs)).toBe('未掌握');
});

test('蒙对了计为不正确', () => {
  const logs = [log('蒙对了', 1), log('蒙对了', 2), log('蒙对了', 3)];
  expect(computeMastery(logs)).toBe('未掌握');
});

test('蒙对了混入正确条时判部分掌握', () => {
  const logs = [log('做对了', 1), log('蒙对了', 2), log('做对了', 3)];
  expect(computeMastery(logs)).toBe('部分掌握');
});

test('不足 3 条按实际条数计算', () => {
  expect(computeMastery([log('做对了', 1)])).toBe('已掌握');
  expect(computeMastery([log('做错了', 1)])).toBe('未掌握');
  expect(computeMastery([log('做对了', 1), log('做错了', 2)])).toBe('部分掌握');
});

test('只看最近 3 条，更早的错误日志不参与', () => {
  const logs = [
    log('做错了', 1),
    log('做对了', 2),
    log('做对了', 3),
    log('做对了', 4),
  ];
  expect(computeMastery(logs)).toBe('已掌握');
});

test('日志乱序传入仍按 createdAt 取最近 3 条', () => {
  const logs = [
    log('做对了', 4),
    log('做对了', 2),
    log('做错了', 1),
    log('做对了', 3),
  ];
  expect(computeMastery(logs)).toBe('已掌握');
});
