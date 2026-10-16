const { themeBehavior, applyTheme } = require('../../behaviors/theme');
const storage = require('../../services/storage');
const stats = require('../../services/stats.service');
const practice = require('../../services/practice.service');
const auth = require('../../services/auth.service');

Page({
  behaviors: [themeBehavior],

  data: {
    total: 0,
    sessionCount: 0,
    masteredCount: 0,
    isDark: false,
    signedIn: false,
    nickName: '未登录',
    avatarUrl: '',
  },

  async onShow() {
    this.getTabBar().setData({ selected: 3 });
    const [overview, sessions, profile] = await Promise.all([
      stats.overview(),
      practice.listSessions(),
      auth.getProfile(),
    ]);
    this.setData({
      total: overview.total,
      sessionCount: sessions.length,
      masteredCount: overview.masteryCounts['已掌握'],
      isDark: storage.get('theme', 'light') === 'dark',
      signedIn: Boolean(profile),
      nickName: profile ? profile.nickName : '未登录',
      avatarUrl: profile ? profile.avatarUrl : '',
    });
  },

  onToggleTheme(e) {
    storage.set('theme', e.detail.value ? 'dark' : 'light');
    applyTheme(this);
    this.setData({ isDark: e.detail.value });
  },

  onGoLogin() {
    wx.navigateTo({ url: '/pages/login/login' });
  },

  onGoHistory() {
    wx.navigateTo({ url: '/pages/practice-history/practice-history' });
  },

  onGoExport() {
    wx.navigateTo({ url: '/pages/export/export' });
  },

  onGoCategory() {
    wx.switchTab({ url: '/pages/mistakes/mistakes' });
  },

  onGoSettings() {
    wx.navigateTo({ url: '/pages/settings/settings' });
  },
});
