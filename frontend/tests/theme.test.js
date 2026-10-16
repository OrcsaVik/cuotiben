const {
  normalizeTheme,
  toThemeClass,
  navBarColor,
  windowBackground,
} = require('../utils/theme');

test('已经是合法主题值时原样返回', () => {
  expect(normalizeTheme('light')).toBe('light');
  expect(normalizeTheme('dark')).toBe('dark');
});

test('缺失值归一化为 light', () => {
  expect(normalizeTheme(undefined)).toBe('light');
  expect(normalizeTheme(null)).toBe('light');
  expect(normalizeTheme('')).toBe('light');
});

test('非法值归一化为 light，不抛异常', () => {
  expect(normalizeTheme('Dark')).toBe('light');
  expect(normalizeTheme('blue')).toBe('light');
  expect(normalizeTheme({})).toBe('light');
  expect(normalizeTheme(0)).toBe('light');
});

test('light 对应 theme-light，dark 对应 theme-dark', () => {
  expect(toThemeClass('light')).toBe('theme-light');
  expect(toThemeClass('dark')).toBe('theme-dark');
});

test('返回值永不为空串，否则浅色下根节点挂不到任何令牌类', () => {
  expect(toThemeClass('light')).not.toBe('');
  expect(toThemeClass(undefined)).not.toBe('');
});

test('导航栏浅色为白底黑字', () => {
  expect(navBarColor('light')).toEqual({
    frontColor: '#000000',
    backgroundColor: '#FFFFFF',
  });
});

test('导航栏深色为深底白字', () => {
  expect(navBarColor('dark')).toEqual({
    frontColor: '#ffffff',
    backgroundColor: '#111318',
  });
});

test('frontColor 只可能是微信接受的两个字面量', () => {
  expect(['#000000', '#ffffff']).toContain(navBarColor('light').frontColor);
  expect(['#000000', '#ffffff']).toContain(navBarColor('dark').frontColor);
});

test('窗口背景色与页面背景令牌一致', () => {
  expect(windowBackground('light')).toEqual({
    backgroundColor: '#FFFFFF',
    backgroundColorTop: '#FFFFFF',
    backgroundColorBottom: '#FFFFFF',
  });
  expect(windowBackground('dark')).toEqual({
    backgroundColor: '#111318',
    backgroundColorTop: '#111318',
    backgroundColorBottom: '#111318',
  });
});

test('非法主题值回退到浅色窗口背景', () => {
  expect(windowBackground('blue').backgroundColor).toBe('#FFFFFF');
});
