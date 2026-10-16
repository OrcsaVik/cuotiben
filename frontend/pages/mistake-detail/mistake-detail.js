const { themeBehavior } = require('../../behaviors/theme');
const mistake = require('../../services/mistake.service');
const category = require('../../services/category.service');
const practice = require('../../services/practice.service');
const storage = require('../../services/storage');
const { formatDate } = require('../../utils/date');

function toText(answer) {
  return Array.isArray(answer) ? answer.join('　') : answer;
}

Page({
  behaviors: [themeBehavior],

  data: {
    record: null,
    subjectName: '',
    pointName: '',
    answerText: '',
    answerRevealed: false,
    reviewLogs: [],
    lastReviewText: '',
  },

  async onLoad(options) {
    const record = await mistake.get(options.id);
    const names = await category.resolve(record.subjectId, record.knowledgeId);
    const logs = storage
      .get('reviewLogs', [])
      .filter((log) => log.mistakeId === options.id)
      .sort((a, b) => b.createdAt - a.createdAt);

    this.setData({
      record,
      subjectName: names.subjectName,
      pointName: names.pointName,
      answerText: toText(record.answer),
      reviewLogs: logs.map((log) => ({
        id: log.id,
        verdict: log.verdict,
        dateText: formatDate(log.createdAt),
      })),
      lastReviewText: formatDate(logs.length ? logs[0].createdAt : record.createdAt),
    });
  },

  onPreviewImage() {
    wx.previewImage({ urls: [this.data.record.imagePath] });
  },

  onToggleAnswer(e) {
    this.setData({ answerRevealed: e.detail.revealed });
  },

  async onRedo() {
    const session = await practice.createSession([this.data.record.id]);
    wx.navigateTo({ url: '/pages/practice/practice?sessionId=' + session.id });
  },

  onEdit() {
    wx.navigateTo({ url: '/pages/mistake-edit/mistake-edit?id=' + this.data.record.id });
  },

  async onDelete() {
    const res = await wx.showModal({
      title: '删除错题',
      content: '该错题与其复习历史一并删除',
      confirmText: '删除',
    });
    if (!res.confirm) return;
    await mistake.remove(this.data.record.id);
    wx.navigateBack();
  },
});
