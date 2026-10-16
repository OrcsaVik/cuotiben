const storage = require('../services/storage');
const mistake = require('../services/mistake.service');
const { seed, bootstrap } = require('../mock/seed');

const DAY = 24 * 60 * 60 * 1000;
let NOW;

beforeAll(() => {
  jest.useFakeTimers();
  NOW = new Date('2026-10-15T12:00:00').getTime();
  jest.setSystemTime(NOW);
});

afterAll(() => {
  jest.useRealTimers();
});

beforeEach(() => {
  global.__resetWx();
  seed();
});

test('掌握度、复习次数、最近复习时间由该错题的复习日志推导', async () => {
  const m01 = await mistake.get('m01');
  expect(m01.reviewCount).toBe(2);
  expect(m01.lastReviewAt).toBe(NOW - 15 * DAY);
  expect(m01.mastery).toBe('已掌握');
});

test('从未复习过的错题保持未掌握、零次数', async () => {
  const m25 = await mistake.get('m25');
  expect(m25.reviewCount).toBe(0);
  expect(m25.lastReviewAt).toBeNull();
  expect(m25.mastery).toBe('未掌握');
});

test('首页掌握度分布不再全是未掌握', async () => {
  const stats = require('../services/stats.service');
  const overview = await stats.overview();
  expect(overview.masteryCounts['已掌握']).toBeGreaterThan(0);
  expect(overview.masteryCounts['未掌握']).toBeLessThan(overview.total);
});

test('bootstrap 已有 initialized 标记时不重新播种', () => {
  storage.set('mistakes', [{ id: 'keep', stem: '保留', createdAt: NOW, tags: [] }]);
  storage.set('initialized', true);
  bootstrap();
  expect(storage.get('mistakes', [])).toHaveLength(1);
});
