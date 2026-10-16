test('wx.mock.js 已通过 setupFiles 注入全局，storage 可读写', () => {
  expect(typeof wx).toBe('object');

  wx.setStorageSync('harness:probe', { ok: true });
  expect(wx.getStorageSync('harness:probe')).toEqual({ ok: true });
  expect(wx.getStorageSync('harness:missing')).toBe('');

  global.__resetWx();
  expect(wx.getStorageSync('harness:probe')).toBe('');
});
