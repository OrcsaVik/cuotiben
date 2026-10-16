const stats = require('../../services/stats.service');
const mistake = require('../../services/mistake.service');
const category = require('../../services/category.service');
const practice = require('../../services/practice.service');
const { themeBehavior } = require('../../behaviors/theme');

Page({
  behaviors: [themeBehavior],

  data: {
    rows: [],
    selectedIds: [],
  },

  async onShow() {
    const entries = await stats.pendingReview();
    this.setData({ rows: await this.decorate(entries), selectedIds: [] });
  },

  async decorate(entries) {
    const [records, subjects] = await Promise.all([mistake.list(), category.listSubjects()]);
    const byId = new Map(records.map((item) => [item.id, item]));
    const subjectNames = new Map(subjects.map((item) => [item.id, item.name]));
    const subjectIds = [...new Set(entries.map((entry) => entry.mistake.subjectId))];
    const pointLists = await Promise.all(subjectIds.map((id) => category.listPoints(id)));
    const pointNames = new Map();
    subjectIds.forEach((id, index) => {
      pointNames.set(id, new Map(pointLists[index].map((point) => [point.id, point.name])));
    });

    return entries.map((entry) => {
      const record = byId.get(entry.mistake.id);
      return {
        id: entry.mistake.id,
        overdueDays: entry.overdueDays,
        mistake: Object.assign({}, record, {
          subjectName: subjectNames.get(record.subjectId),
          pointName: pointNames.get(record.subjectId).get(record.knowledgeId),
        }),
      };
    });
  },

  toggleItem(id) {
    const ids = this.data.selectedIds.slice();
    const index = ids.indexOf(id);
    if (index < 0) ids.push(id);
    else ids.splice(index, 1);
    this.setData({ selectedIds: ids });
  },

  onToggleItem(e) {
    this.toggleItem(e.detail.id);
  },

  onToggleAll() {
    const all = this.data.rows.length > 0 && this.data.selectedIds.length === this.data.rows.length;
    this.setData({ selectedIds: all ? [] : this.data.rows.map((row) => row.id) });
  },

  async onCreatePractice() {
    const session = await practice.createSession(this.data.selectedIds);
    this.setData({ selectedIds: [] });
    wx.navigateTo({ url: '/pages/practice/practice?sessionId=' + session.id });
  },

  onGoHome() {
    wx.switchTab({ url: '/pages/index/index' });
  },
});
