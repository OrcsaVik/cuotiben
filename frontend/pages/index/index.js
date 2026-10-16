const stats = require('../../services/stats.service');
const practice = require('../../services/practice.service');
const category = require('../../services/category.service');
const auth = require('../../services/auth.service');
const { themeBehavior } = require('../../behaviors/theme');

const LEVELS = [
  { level: '未掌握', tone: 'danger' },
  { level: '部分掌握', tone: 'warning' },
  { level: '已掌握', tone: 'success' },
];

function toPercent(ratio) {
  return Math.round(ratio * 100);
}

Page({
  behaviors: [themeBehavior],

  data: {
    total: 0,
    weekAdded: 0,
    sessionCount: 0,
    pendingCount: 0,
    masteryRows: [],
    subjectRows: [],
    subjects: [],
    showLoginPrompt: false,
    promptReady: false,
  },

  async onLoad() {
    this.setData({ subjects: await category.listSubjects() });
  },

  async onShow() {
    this.getTabBar().setData({ selected: 0 });

    const [overview, sessions, distribution, pending, profile] = await Promise.all([
      stats.overview(),
      practice.listSessions(),
      stats.subjectDistribution(5),
      stats.pendingReview(),
      auth.getProfile(),
    ]);
    const max = Math.max(...distribution.map((item) => item.count), 0);

    this.setData({
      total: overview.total,
      weekAdded: overview.weekAdded,
      sessionCount: sessions.length,
      pendingCount: pending.length,
      masteryRows: LEVELS.map((item) => ({
        level: item.level,
        tone: item.tone,
        count: overview.masteryCounts[item.level],
        pct: toPercent(overview.masteryRatios[item.level]),
      })),
      subjectRows: distribution.map((item) => ({
        subjectId: item.subjectId,
        subjectName: item.subjectName,
        count: item.count,
        width: Math.round((item.count / max) * 100),
      })),
    });

    if (!profile && !getApp().globalData.loginPromptDismissed) this.openLoginPrompt();
  },

  onPendingTap() {
    wx.navigateTo({ url: '/pages/pending-review/pending-review' });
  },

  onSubjectTap(e) {
    getApp().globalData.applySubjectId = e.currentTarget.dataset.subjectId;
    wx.switchTab({ url: '/pages/mistakes/mistakes' });
  },

  onGoCapture() {
    wx.switchTab({ url: '/pages/capture/capture' });
  },

  // 浮层插入即终态就没有起始帧可过渡，所以先挂出、下一帧再置 promptReady。
  openLoginPrompt() {
    this.setData({ showLoginPrompt: true, promptReady: false });
    setTimeout(() => this.setData({ promptReady: true }), 20);
  },

  dismissLoginPrompt() {
    getApp().globalData.loginPromptDismissed = true;
    this.setData({ showLoginPrompt: false, promptReady: false });
  },

  onPromptCancel() {
    this.dismissLoginPrompt();
  },

  onPromptLogin() {
    this.dismissLoginPrompt();
    wx.navigateTo({ url: '/pages/login/login' });
  },
});
