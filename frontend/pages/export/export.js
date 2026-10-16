const exportService = require('../../services/export.service');
const categoryService = require('../../services/category.service');
const { formatDate, semesterStart, dayStart, dayEnd } = require('../../utils/date');
const { themeBehavior } = require('../../behaviors/theme');

const DAY = 24 * 60 * 60 * 1000;

const TIME_RANGES = [
  { key: '7d', label: '近 7 天' },
  { key: '30d', label: '近 30 天' },
  { key: 'semester', label: '本学期' },
  { key: 'custom', label: '自定义' },
];

Page({
  behaviors: [themeBehavior],

  data: {
    subjects: [],
    timeRanges: TIME_RANGES,
    timeRange: '30d',
    startDate: '',
    endDate: '',
    count: 0,
  },

  async onLoad() {
    const subjects = await categoryService.listSubjects();
    this.setData({
      subjects: subjects.map((item) => ({ id: item.id, name: item.name, selected: false })),
    });
    this.refreshCount();
  },

  buildFilter(now = Date.now()) {
    const range = this.data.timeRange;
    let startAt = semesterStart(now);
    let endAt = 0;
    if (range === '7d') startAt = now - 7 * DAY;
    else if (range === '30d') startAt = now - 30 * DAY;
    else if (range === 'custom') {
      startAt = dayStart(this.data.startDate);
      endAt = dayEnd(this.data.endDate);
    }
    return {
      subjectIds: this.data.subjects.filter((item) => item.selected).map((item) => item.id),
      startAt,
      endAt,
      knowledgeId: '',
      questionType: [],
      mastery: [],
      tags: [],
      keyword: '',
    };
  },

  async refreshCount() {
    const count = await exportService.count(this.buildFilter());
    this.setData({ count });
  },

  onToggleSubject(e) {
    const id = e.currentTarget.dataset.id;
    const subjects = this.data.subjects.map((item) =>
      item.id === id ? Object.assign({}, item, { selected: !item.selected }) : item
    );
    this.setData({ subjects });
    this.refreshCount();
  },

  onPickRange(e) {
    const key = e.currentTarget.dataset.key;
    if (key === this.data.timeRange) return;
    if (key === 'custom') {
      const now = Date.now();
      this.setData({
        timeRange: key,
        startDate: this.data.startDate || formatDate(semesterStart(now)),
        endDate: this.data.endDate || formatDate(now),
      });
    } else {
      this.setData({ timeRange: key });
    }
    this.refreshCount();
  },

  onStartDateChange(e) {
    this.setData({ startDate: e.detail.value });
    this.refreshCount();
  },

  onEndDateChange(e) {
    this.setData({ endDate: e.detail.value });
    this.refreshCount();
  },

  async onExport() {
    wx.showLoading({ title: '生成中', mask: true });
    const [res] = await Promise.all([
      exportService.buildPdf(this.buildFilter()),
      new Promise((resolve) => setTimeout(resolve, 2000)),
    ]);
    wx.hideLoading();
    this.openPdf(res.path);
  },

  openPdf(filePath) {
    wx.openDocument({
      filePath,
      fileType: 'pdf',
      fail: () => {
        wx.showToast({ title: '无法直接打开，转为分享文件', icon: 'none' });
        wx.shareFileMessage({ filePath, fileName: '错题集.pdf' });
      },
    });
  },
});
