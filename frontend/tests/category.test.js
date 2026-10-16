const category = require('../services/category.service');

test('Service 方法一律返回 Promise', () => {
  expect(category.listSubjects()).toBeInstanceOf(Promise);
  expect(category.listPoints('math')).toBeInstanceOf(Promise);
  expect(category.resolve('math', 'math-01')).toBeInstanceOf(Promise);
});

test('科目列表每项都有 id 与 name', async () => {
  const subjects = await category.listSubjects();
  expect(subjects.length).toBeGreaterThan(0);
  subjects.forEach((subject) => {
    expect(typeof subject.id).toBe('string');
    expect(typeof subject.name).toBe('string');
  });
});

test('知识点只返回指定科目下的条目', async () => {
  const points = await category.listPoints('math');
  expect(points.length).toBeGreaterThan(0);
  points.forEach((point) => {
    expect(point.id.startsWith('math-')).toBe(true);
  });
});

test('未知科目返回空数组而不抛异常', async () => {
  await expect(category.listPoints('nope')).resolves.toEqual([]);
  await expect(category.listPoints(undefined)).resolves.toEqual([]);
});

test('resolve 返回科目名与知识点名', async () => {
  await expect(category.resolve('math', 'math-01')).resolves.toEqual({
    subjectName: '数学',
    pointName: '集合与常用逻辑',
  });
});

test('resolve 遇到未知 id 返回空字符串', async () => {
  await expect(category.resolve('nope', 'math-01')).resolves.toEqual({
    subjectName: '',
    pointName: '',
  });
  await expect(category.resolve('math', 'math-99')).resolves.toEqual({
    subjectName: '数学',
    pointName: '',
  });
});
