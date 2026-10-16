const { formatDate, relativeDays, weekStart, semesterStart, dayStart, dayEnd } = require('../utils/date');

const DAY = 24 * 60 * 60 * 1000;

test('formatDate 月日补零到两位', () => {
  expect(formatDate(new Date(2026, 0, 5).getTime())).toBe('2026-01-05');
});

test('relativeDays 向下取整，不足一天算 0', () => {
  const now = new Date(2026, 9, 10, 12).getTime();
  expect(relativeDays(now - 2 * DAY - 60 * 60 * 1000, now)).toBe(2);
  expect(relativeDays(now - 60 * 60 * 1000, now)).toBe(0);
});

test('weekStart 回到本周一零点', () => {
  const thursday = new Date(2026, 9, 8, 15, 30).getTime();
  expect(new Date(weekStart(thursday))).toEqual(new Date(2026, 9, 5, 0, 0, 0, 0));
});

test('weekStart 对周一自身返回当天零点而不是上周', () => {
  const monday = new Date(2026, 9, 5, 8).getTime();
  expect(new Date(weekStart(monday))).toEqual(new Date(2026, 9, 5, 0, 0, 0, 0));
});

test('semesterStart 秋季学期从 9 月 1 日起算', () => {
  expect(new Date(semesterStart(new Date(2026, 9, 8).getTime()))).toEqual(new Date(2026, 8, 1));
});

test('semesterStart 次年 1、2 月仍归上一个秋季学期', () => {
  expect(new Date(semesterStart(new Date(2027, 1, 10).getTime()))).toEqual(new Date(2026, 8, 1));
});

test('semesterStart 春季学期从 3 月 1 日起算', () => {
  expect(new Date(semesterStart(new Date(2026, 2, 1).getTime()))).toEqual(new Date(2026, 2, 1));
});

test('dayStart 把 YYYY-MM-DD 解析为本地零点', () => {
  expect(new Date(dayStart('2026-10-09'))).toEqual(new Date(2026, 9, 9, 0, 0, 0, 0));
});

test('dayEnd 覆盖到当天最后一毫秒', () => {
  expect(dayEnd('2026-10-09') - dayStart('2026-10-09')).toBe(DAY - 1);
});
