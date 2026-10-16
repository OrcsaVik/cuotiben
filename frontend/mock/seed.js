const storage = require('../services/storage');
const { createSeedRecords } = require('./mistakes');
const { computeMastery } = require('../utils/mastery');

const DEFAULT_SETTINGS = { simulateOcrFailure: false };

// 掌握度、复习次数、最近复习时间全部由种子复习日志推导。
// 少了这一步，首页掌握度三档恒为「未掌握 100%」，详情页的复习次数也和下方的历史对不上。
function withReviewState(mistakes, reviewLogs) {
  return mistakes.map((record) => {
    const logs = reviewLogs.filter((log) => log.mistakeId === record.id);
    if (logs.length === 0) return record;
    return Object.assign({}, record, {
      reviewCount: logs.length,
      lastReviewAt: logs.reduce((latest, log) => (log.createdAt > latest ? log.createdAt : latest), 0),
      mastery: computeMastery(logs),
    });
  });
}

function seed() {
  const { mistakes, reviewLogs, sessions } = createSeedRecords();
  const theme = storage.get('theme', 'light');

  storage.set('mistakes', withReviewState(mistakes, reviewLogs));
  storage.set('reviewLogs', reviewLogs);
  storage.set('sessions', sessions);
  storage.set('settings', DEFAULT_SETTINGS);
  storage.set('theme', theme);
  storage.set('initialized', true);
}

function bootstrap() {
  if (!storage.has('initialized')) seed();
}

// 重置演示数据不该把人的头像一起抹掉，所以单独把 profile 搬回来。
function reset() {
  const theme = storage.get('theme', 'light');
  const profile = storage.get('profile', null);
  storage.clear();
  storage.set('theme', theme);
  if (profile) storage.set('profile', profile);
  seed();
}

// 清空全部数据按字面执行：连同登录身份一起清掉。
function wipe() {
  const theme = storage.get('theme', 'light');
  storage.clear();
  storage.set('theme', theme);
  storage.set('initialized', true);
}

module.exports = { seed, bootstrap, reset, wipe, DEFAULT_SETTINGS };
