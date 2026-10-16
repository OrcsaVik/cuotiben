const storage = require('../services/storage');
const mistake = require('../services/mistake.service');
const { createSeedRecords } = require('../mock/mistakes');

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
  const data = createSeedRecords();
  storage.set('mistakes', data.mistakes);
  storage.set('reviewLogs', data.reviewLogs);
  storage.set('sessions', data.sessions);
});

test('Service 方法一律返回 Promise', () => {
  expect(mistake.list()).toBeInstanceOf(Promise);
  expect(mistake.get('m01')).toBeInstanceOf(Promise);
  expect(mistake.create({ stem: 'x' })).toBeInstanceOf(Promise);
  expect(mistake.update('m01', { stem: 'y' })).toBeInstanceOf(Promise);
  expect(mistake.remove('m01')).toBeInstanceOf(Promise);
  expect(mistake.query({}, {})).toBeInstanceOf(Promise);
  expect(mistake.countBy({})).toBeInstanceOf(Promise);
});

test('list 按 createdAt 倒序', async () => {
  const records = await mistake.list();
  expect(records).toHaveLength(25);
  expect(records[0].id).toBe('m25');
  for (let i = 1; i < records.length; i += 1) {
    expect(records[i - 1].createdAt).toBeGreaterThanOrEqual(records[i].createdAt);
  }
});

test('get 命中返回单条，未命中返回 null', async () => {
  const found = await mistake.get('m01');
  expect(found.id).toBe('m01');
  await expect(mistake.get('nope')).resolves.toBeNull();
});

test('create 补齐 id / createdAt / reviewCount / lastReviewAt / mastery', async () => {
  const created = await mistake.create({ stem: '新错题', subjectId: 'math' });
  expect(typeof created.id).toBe('string');
  expect(created.id).not.toBe('');
  expect(typeof created.createdAt).toBe('number');
  expect(created.reviewCount).toBe(0);
  expect(created.lastReviewAt).toBeNull();
  expect(created.mastery).toBe('未掌握');
  const records = await mistake.list();
  expect(records).toHaveLength(26);
});

test('update 打补丁并返回更新后的记录', async () => {
  const updated = await mistake.update('m01', { stem: '改过的题干' });
  expect(updated.stem).toBe('改过的题干');
  const found = await mistake.get('m01');
  expect(found.stem).toBe('改过的题干');
});

test('keyword 对 stem 做不区分大小写的子串匹配', async () => {
  const result = await mistake.query({ keyword: 'LIVED' }, {});
  expect(result.total).toBe(1);
  expect(result.items[0].id).toBe('m11');
});

test('多个筛选条件之间是 AND', async () => {
  const result = await mistake.query({ subjectId: 'math', questionType: ['填空'] }, {});
  expect(result.items.map((item) => item.id).sort()).toEqual(['m02', 'm09']);
});

test('tags 命中任一标签即匹配', async () => {
  const result = await mistake.query({ tags: ['动量定理', '时态'] }, {});
  expect(result.items.map((item) => item.id).sort()).toEqual(['m03', 'm18']);
});

test('种子记录缺 mastery 字段时按未掌握参与筛选', async () => {
  const result = await mistake.query({ mastery: ['未掌握'] }, {});
  expect(result.total).toBe(25);
});

test('subjectIds 命中任一科目即匹配', async () => {
  const result = await mistake.query({ subjectIds: ['math', 'physics'] }, {});
  expect(result.total).toBe(10);
});

test('startAt 起算含边界，种子数据近 20 天录入的有 15 条', async () => {
  const result = await mistake.query({ startAt: NOW - 20 * DAY }, {});
  expect(result.total).toBe(15);
});

test('startAt 与 endAt 同时收窄录入时间区间', async () => {
  const result = await mistake.query({ startAt: NOW - 30 * DAY, endAt: NOW - 10 * DAY }, {});
  expect(result.items.map((item) => item.id).sort()).toEqual([
    'm05', 'm06', 'm07', 'm08', 'm09', 'm10', 'm11', 'm12', 'm13', 'm14', 'm15', 'm23',
  ]);
});

test('subjectIds 与其他维度是 AND', async () => {
  const result = await mistake.query({ subjectIds: ['math'], startAt: NOW - 30 * DAY }, {});
  expect(result.items.map((item) => item.id).sort()).toEqual(['m05', 'm09', 'm13', 'm17']);
});

test('分页默认 limit 20，offset 越界后 hasMore 为 false', async () => {
  const first = await mistake.query({}, {});
  expect(first.items).toHaveLength(20);
  expect(first.total).toBe(25);
  expect(first.hasMore).toBe(true);
  const last = await mistake.query({}, { offset: 20 });
  expect(last.items).toHaveLength(5);
  expect(last.hasMore).toBe(false);
});

test('countBy 与 query 的 total 一致', async () => {
  const filter = { subjectId: 'physics' };
  const [count, result] = await Promise.all([
    mistake.countBy(filter),
    mistake.query(filter, {}),
  ]);
  expect(count).toBe(4);
  expect(count).toBe(result.total);
});

test('remove 级联删除该错题的复习日志，不动其他错题', async () => {
  const before = await mistake.get('m03');
  await mistake.remove('m01');
  await expect(mistake.get('m01')).resolves.toBeNull();
  const logs = storage.get('reviewLogs', []);
  expect(logs.some((log) => log.mistakeId === 'm01')).toBe(false);
  const after = await mistake.get('m03');
  expect(after).toEqual(before);
});
