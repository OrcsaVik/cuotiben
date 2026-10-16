const { themeBehavior } = require('../../behaviors/theme');
const practice = require('../../services/practice.service');
const mistake = require('../../services/mistake.service');
const { formatDate } = require('../../utils/date');

function accuracyTone(accuracy) {
  if (accuracy >= 0.8) return 'success';
  if (accuracy < 0.6) return 'danger';
  return 'neutral';
}

function formatAnswer(answer) {
  return Array.isArray(answer) ? answer.join('；') : String(answer);
}

Page({
  behaviors: [themeBehavior],

  data: {
    sessions: [],
    expandedId: '',
    details: {},
  },

  async onShow() {
    const sessions = await practice.listSessions();
    this.setData({
      sessions: sessions.map((session) => ({
        id: session.id,
        timeText: session.finishedAt ? formatDate(session.finishedAt) : '未完成',
        total: session.total,
        accuracyText: Math.round(session.accuracy * 100) + '%',
        tone: accuracyTone(session.accuracy),
      })),
      expandedId: '',
      details: {},
    });
  },

  async onToggleSession(e) {
    const id = e.currentTarget.dataset.id;
    if (this.data.expandedId === id) {
      this.setData({ expandedId: '' });
      return;
    }
    if (!this.data.details[id]) {
      const { items } = await practice.sessionDetail(id);
      const records = await Promise.all(
        items.map((item) => mistake.get(item.mistakeId)),
      );
      this.setData({
        ['details.' + id]: items.map((item, index) =>
          Object.assign({}, item, {
            answerText: formatAnswer(records[index].answer),
          }),
        ),
      });
    }
    this.setData({ expandedId: id });
  },

  onGoMistakes() {
    wx.switchTab({ url: '/pages/mistakes/mistakes' });
  },
});
