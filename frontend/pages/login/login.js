const auth = require('../../services/auth.service');
const image = require('../../utils/image');
const { formatDate } = require('../../utils/date');
const { themeBehavior, applyTheme } = require('../../behaviors/theme');

Page({
  behaviors: [themeBehavior],

  data: {
    ready: false,
    signedIn: false,
    profile: null,
    signedInLabel: '',
    avatarUrl: '',
    nickName: '',
  },

  // 入场靠 transition：先渲染一帧「未就位」态，再挂 is-ready，否则三块内容没有起始值可过渡。
  onLoad() {
    setTimeout(() => this.setData({ ready: true }), 50);
  },

  async onShow() {
    applyTheme(this);
    const profile = await auth.getProfile();
    this.setData({
      signedIn: Boolean(profile),
      profile,
      signedInLabel: profile ? formatDate(profile.signedInAt) : '',
    });
  },

  async onChooseAvatar(e) {
    this.setData({ avatarUrl: await image.saveToUserData(e.detail.avatarUrl) });
  },

  onNickChange(e) {
    this.setData({ nickName: e.detail.value });
  },

  async onSignIn() {
    const profile = await auth.signIn({
      nickName: this.data.nickName,
      avatarUrl: this.data.avatarUrl,
    });
    this.setData({
      signedIn: true,
      profile,
      signedInLabel: formatDate(profile.signedInAt),
    });
  },

  async onSignOut() {
    const res = await wx.showModal({
      title: '退出登录',
      content: '只清除头像和昵称，错题数据保留在本机',
      confirmText: '退出',
      cancelText: '取消',
    });
    if (!res.confirm) return;
    await auth.signOut();
    this.setData({
      signedIn: false,
      profile: null,
      signedInLabel: '',
      avatarUrl: '',
      nickName: '',
    });
  },

  onSkip() {
    wx.navigateBack({ fail: () => wx.switchTab({ url: '/pages/index/index' }) });
  },
});
