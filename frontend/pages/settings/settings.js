const { themeBehavior } = require('../../behaviors/theme');
const storage = require('../../services/storage');
const { reset, wipe, DEFAULT_SETTINGS } = require('../../mock/seed');

Page({
  behaviors: [themeBehavior],

  data: {
    simulateOcrFailure: false,
  },

  onShow() {
    const settings = storage.get('settings', DEFAULT_SETTINGS);
    this.setData({ simulateOcrFailure: settings.simulateOcrFailure });
  },

  onOcrFailureChange(e) {
    const settings = storage.get('settings', DEFAULT_SETTINGS);
    settings.simulateOcrFailure = e.detail.value;
    storage.set('settings', settings);
    this.setData({ simulateOcrFailure: settings.simulateOcrFailure });
  },

  onResetDemo() {
    wx.showModal({
      title: '重置演示数据',
      content: '将清空当前数据并重新写入演示错题',
      success: (res) => {
        if (!res.confirm) return;
        reset();
        wx.showToast({ title: '已重置', icon: 'success' });
        wx.navigateBack();
      },
    });
  },

  onWipeAll() {
    wx.showModal({
      title: '清空全部数据',
      content: '将清空全部数据且不留演示样例，登录身份一并清除',
      success: (res) => {
        if (!res.confirm) return;
        wipe();
        wx.showToast({ title: '已清空', icon: 'success' });
        wx.navigateBack();
      },
    });
  },
});
