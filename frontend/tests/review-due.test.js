const { isDue, overdueDays } = require('../utils/review-due');

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

test('最近复习超过 7 天判待复习', () => {
  const mistake = { createdAt: NOW - 40 * DAY, lastReviewAt: NOW - 8 * DAY };
  expect(isDue(mistake, NOW)).toBe(true);
});

test('恰好 7 天不判待复习', () => {
  const mistake = { createdAt: NOW - 40 * DAY, lastReviewAt: NOW - 7 * DAY };
  expect(isDue(mistake, NOW)).toBe(false);
});

test('7 天内复习过不判待复习', () => {
  const mistake = { createdAt: NOW - 40 * DAY, lastReviewAt: NOW - 2 * DAY };
  expect(isDue(mistake, NOW)).toBe(false);
});

test('从未复习过的错题以录入时间起算', () => {
  const neverReviewed = { createdAt: NOW - 10 * DAY, lastReviewAt: null };
  expect(isDue(neverReviewed, NOW)).toBe(true);
  expect(isDue({ createdAt: NOW - 3 * DAY }, NOW)).toBe(false);
});

test('超期天数等于超过阈值的天数', () => {
  const mistake = { createdAt: NOW - 40 * DAY, lastReviewAt: NOW - 10 * DAY };
  expect(overdueDays(mistake, NOW)).toBe(3);
});

test('从未复习过时超期天数也从录入时间起算', () => {
  expect(overdueDays({ createdAt: NOW - 9 * DAY - 5 * 60 * 60 * 1000 }, NOW)).toBe(2);
});

test('days 参数可覆盖 7 天阈值', () => {
  const mistake = { createdAt: NOW - 40 * DAY, lastReviewAt: NOW - 8 * DAY };
  expect(isDue(mistake, NOW, 10)).toBe(false);
});
