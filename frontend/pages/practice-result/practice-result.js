const { themeBehavior } = require('../../behaviors/theme');
const practice = require('../../services/practice.service');
const { CORRECT, WRONG, LUCKY } = require('../../mock/mistakes');

function formatDuration(ms) {
  const totalSec = Math.round(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  const secText = sec < 10 ? '0' + sec : String(sec);
  return min > 0 ? min + ' 分 ' + secText + ' 秒' : sec + ' 秒';
}

function collectChanges(items) {
  const changes = [];
  const seen = {};
  items.forEach((item) => {
    if (item.masteryBefore === item.masteryAfter || seen[item.mistakeId]) return;
    seen[item.mistakeId] = true;
    changes.push({
      mistakeId: item.mistakeId,
      stem: item.stem,
      before: item.masteryBefore,
      after: item.masteryAfter,
    });
  });
  return changes;
}

Page({
  behaviors: [themeBehavior],

  data: {
    pct: 0,
    counts: { correct: 0, wrong: 0, lucky: 0 },
    durationText: '',
    changes: [],
  },

  async onLoad(query) {
    this.sessionId = query.sessionId;
    const { session, items } = await practice.sessionDetail(query.sessionId);
    const counts = { correct: 0, wrong: 0, lucky: 0 };
    items.forEach((item) => {
      if (item.verdict === CORRECT) counts.correct += 1;
      else if (item.verdict === LUCKY) counts.lucky += 1;
      else counts.wrong += 1;
    });
    this.setData({
      pct: Math.round((counts.correct / items.length) * 100),
      counts,
      durationText: formatDuration(session.durationMs),
      changes: collectChanges(items),
    });
  },

  async onRedoWrong() {
    const session = await practice.redoWrong(this.sessionId);
    wx.redirectTo({ url: '/pages/practice/practice?sessionId=' + session.id });
  },

  onGoHome() {
    wx.switchTab({ url: '/pages/index/index' });
  },
});
