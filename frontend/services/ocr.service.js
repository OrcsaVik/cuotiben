const storage = require('./storage');

const FAKE_TEXT =
  '已知数列 {aₙ} 满足 a₁ = 1，aₙ₊₁ = 2aₙ + 1。\n' +
  '(1) 证明 {aₙ + 1} 是等比数列，并求 {aₙ} 的通项公式；\n' +
  '(2) 求数列 {n·aₙ} 的前 n 项和 Sₙ。';

function recognize(filePath) {
  const delay = 1000 + Math.floor(Math.random() * 1000);
  return new Promise((resolve) => {
    setTimeout(() => {
      if (storage.get('settings', {}).simulateOcrFailure) {
        resolve({ ok: false, text: '' });
        return;
      }
      resolve({ ok: true, text: FAKE_TEXT });
    }, delay);
  });
}

module.exports = { recognize };
