const NAV_BAR = {
  light: { frontColor: '#000000', backgroundColor: '#FFFFFF' },
  dark: { frontColor: '#ffffff', backgroundColor: '#111318' },
};

const WINDOW_BG = { light: '#FFFFFF', dark: '#111318' };

function normalizeTheme(value) {
  return value === 'dark' ? 'dark' : 'light';
}

function toThemeClass(theme) {
  return theme === 'dark' ? 'theme-dark' : 'theme-light';
}

function navBarColor(theme) {
  return NAV_BAR[normalizeTheme(theme)];
}

function windowBackground(theme) {
  const color = WINDOW_BG[normalizeTheme(theme)];
  return {
    backgroundColor: color,
    backgroundColorTop: color,
    backgroundColorBottom: color,
  };
}

module.exports = {
  normalizeTheme,
  toThemeClass,
  navBarColor,
  windowBackground,
};
