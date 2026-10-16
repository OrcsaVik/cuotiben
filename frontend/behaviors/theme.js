const storage = require('../services/storage');
const { toThemeClass, navBarColor, windowBackground } = require('../utils/theme');

// Behavior 的自定义方法不会合并进页面实例（实测 this.applyTheme 为 undefined），
// 因此逻辑放这里，页面切换主题时调 applyTheme(this)。
function applyTheme(ctx) {
  const theme = storage.get('theme', 'light');
  const themeClass = toThemeClass(theme);

  ctx.setData({ themeClass });
  wx.setNavigationBarColor(navBarColor(theme));
  wx.setBackgroundColor(windowBackground(theme));

  const tabBar = typeof ctx.getTabBar === 'function' ? ctx.getTabBar() : null;
  if (tabBar) tabBar.setData({ themeClass });
}

const themeBehavior = Behavior({
  data: {
    themeClass: 'theme-light',
  },

  onShow() {
    applyTheme(this);
  },
});

module.exports = { themeBehavior, applyTheme };
