Component({
  data: {
    selected: 0,
    themeClass: 'theme-light',
    list: [
      { pagePath: 'pages/index/index', text: '首页', icon: 'home' },
      { pagePath: 'pages/mistakes/mistakes', text: '错题本', icon: 'note' },
      { pagePath: 'pages/capture/capture', text: '录入', icon: 'add', fab: true },
      { pagePath: 'pages/mine/mine', text: '我的', icon: 'me' },
    ],
  },

  methods: {
    onTap(e) {
      const index = e.currentTarget.dataset.index;
      if (index === this.data.selected) return;
      wx.switchTab({ url: '/' + this.data.list[index].pagePath });
    },
  },
});
