const mistake = require('../../services/mistake.service');
const category = require('../../services/category.service');
const practice = require('../../services/practice.service');
const { themeBehavior } = require('../../behaviors/theme');

const PAGE_SIZE = 20;

const EMPTY_FILTER = {
  subjectId: '',
  knowledgeId: '',
  questionType: [],
  mastery: [],
  tags: [],
  keyword: '',
};

function countActiveConditions(filter) {
  let n = 0;
  if (filter.subjectId) n += 1;
  if (filter.knowledgeId) n += 1;
  if (filter.questionType.length) n += 1;
  if (filter.mastery.length) n += 1;
  if (filter.tags.length) n += 1;
  if (filter.keyword) n += 1;
  return n;
}

Page({
  behaviors: [themeBehavior],

  data: {
    items: [],
    total: 0,
    storeTotal: 0,
    hasMore: false,
    loading: true,
    loadingMore: false,
    filter: Object.assign({}, EMPTY_FILTER),
    filterCount: 0,
    filterVisible: false,
    filterSubjects: [],
    selectMode: false,
    selectedIds: [],
  },

  onLoad(options) {
    this.loadedCount = 0;
    this.subjectNames = null;
    this.pointNames = {};
    if (options.subjectId) {
      this.applyFilter(Object.assign({}, this.data.filter, { subjectId: options.subjectId }));
    }
  },

  onShow() {
    this.getTabBar().setData({ selected: 1 });
    const pending = getApp().globalData.applySubjectId;
    if (pending) {
      getApp().globalData.applySubjectId = '';
      this.applyFilter(Object.assign({}, this.data.filter, { subjectId: pending }));
    }
    this.refresh();
  },

  applyFilter(filter) {
    this.setData({ filter, filterCount: countActiveConditions(filter) });
  },

  async refresh() {
    const [page, storeTotal] = await Promise.all([
      mistake.query(this.data.filter, { offset: 0, limit: PAGE_SIZE }),
      mistake.countBy({}),
    ]);
    const items = await this.decorate(page.items);
    this.loadedCount = items.length;
    this.setData({
      items,
      total: page.total,
      hasMore: page.hasMore,
      storeTotal,
      loading: false,
      loadingMore: false,
      selectedIds: [],
    });
  },

  async onLoadMore() {
    if (!this.data.hasMore || this.data.loadingMore) return;
    this.setData({ loadingMore: true });
    const page = await mistake.query(this.data.filter, {
      offset: this.loadedCount,
      limit: PAGE_SIZE,
    });
    const items = await this.decorate(page.items);
    this.loadedCount += items.length;
    this.setData({
      items: this.data.items.concat(items),
      hasMore: page.hasMore,
      loadingMore: false,
    });
  },

  async decorate(items) {
    const subjectNames = await this.ensureSubjects();
    const pointNames = {};
    for (const item of items) {
      pointNames[item.subjectId] = await this.ensurePoints(item.subjectId);
    }
    return items.map((item) =>
      Object.assign({}, item, {
        subjectName: subjectNames[item.subjectId],
        pointName: pointNames[item.subjectId][item.knowledgeId],
      }),
    );
  },

  async ensureSubjects() {
    if (this.subjectNames) return this.subjectNames;
    const subjects = await category.listSubjects();
    const map = {};
    subjects.forEach((subject) => {
      map[subject.id] = subject.name;
    });
    this.subjectNames = map;
    return map;
  },

  async ensurePoints(subjectId) {
    if (this.pointNames[subjectId]) return this.pointNames[subjectId];
    const points = await category.listPoints(subjectId);
    const map = {};
    points.forEach((point) => {
      map[point.id] = point.name;
    });
    this.pointNames[subjectId] = map;
    return map;
  },

  onToggleSelect() {
    const selectMode = !this.data.selectMode;
    this.setData({ selectMode, selectedIds: [] });
  },

  toggleSelected(id) {
    const ids = this.data.selectedIds.slice();
    const index = ids.indexOf(id);
    if (index < 0) ids.push(id);
    else ids.splice(index, 1);
    this.setData({ selectedIds: ids });
  },

  onCardTap(e) {
    if (this.data.selectMode) {
      this.toggleSelected(e.detail.id);
      return;
    }
    wx.navigateTo({ url: '/pages/mistake-detail/mistake-detail?id=' + e.detail.id });
  },

  onCardCheck(e) {
    this.toggleSelected(e.detail.id);
  },

  async onCreatePractice() {
    const session = await practice.createSession(this.data.selectedIds);
    this.setData({ selectMode: false, selectedIds: [] });
    wx.navigateTo({ url: '/pages/practice/practice?sessionId=' + session.id });
  },

  async onFilterTap() {
    if (!this.data.filterSubjects.length) {
      const subjects = await category.listSubjects();
      const detailed = [];
      for (const subject of subjects) {
        detailed.push(Object.assign({}, subject, { points: await category.listPoints(subject.id) }));
      }
      this.setData({ filterSubjects: detailed });
    }
    this.setData({ filterVisible: true });
  },

  onFilterConfirm(e) {
    this.setData({ filterVisible: false });
    this.applyFilter(e.detail);
    this.refresh();
  },

  onFilterReset() {
    this.applyFilter(Object.assign({}, EMPTY_FILTER));
    this.refresh();
  },

  onFilterClose() {
    this.setData({ filterVisible: false });
  },

  onClearFilter() {
    this.applyFilter(Object.assign({}, EMPTY_FILTER));
    this.refresh();
  },

  onGoCapture() {
    wx.switchTab({ url: '/pages/capture/capture' });
  },
});
