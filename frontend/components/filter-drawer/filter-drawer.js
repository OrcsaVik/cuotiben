const QUESTION_TYPES = ['单选', '多选', '填空', '判断', '解答'];
const MASTERY_LEVELS = ['未掌握', '部分掌握', '已掌握'];

function cloneFilter(filter) {
  return {
    subjectId: filter.subjectId,
    knowledgeId: filter.knowledgeId,
    questionType: filter.questionType.slice(),
    mastery: filter.mastery.slice(),
    tags: filter.tags.slice(),
    keyword: filter.keyword,
  };
}

Component({
  options: {
    addGlobalClass: true,
  },

  properties: {
    visible: { type: Boolean, value: false },
    subjects: { type: Array, value: [] },
    filter: { type: Object, value: null },
  },

  data: {
    draft: null,
    points: [],
    opened: false,
    questionTypes: QUESTION_TYPES,
    masteryLevels: MASTERY_LEVELS,
  },

  observers: {
    visible(visible) {
      if (visible) this.seed();
    },
  },

  methods: {
    seed() {
      const draft = cloneFilter(this.data.filter);
      // 挂载帧先置于屏外，下一帧翻 opened 类才会触发上滑 transition
      this.setData({ draft, points: this.pointsOf(draft.subjectId), opened: false });
      wx.nextTick(() => this.setData({ opened: true }));
    },

    pointsOf(subjectId) {
      if (!subjectId) return [];
      const subject = this.data.subjects.find((item) => item.id === subjectId);
      return subject ? subject.points : [];
    },

    onSubjectChange(e) {
      const subjectId = e.detail.subjectId;
      this.setData({
        'draft.subjectId': subjectId,
        'draft.knowledgeId': '',
        points: this.pointsOf(subjectId),
      });
    },

    onKnowledgeChange(e) {
      // category-picker 抛的载荷键是 pointId，filter 契约键是 knowledgeId，在此换算
      this.setData({ 'draft.knowledgeId': e.detail.pointId });
    },

    onTypeChange(e) {
      this.setData({ 'draft.questionType': e.detail.value });
    },

    onMasteryChange(e) {
      this.setData({ 'draft.mastery': e.detail.value });
    },

    onKeywordInput(e) {
      this.setData({ 'draft.keyword': e.detail.value });
    },

    onTagAdd(e) {
      this.setData({ 'draft.tags': this.data.draft.tags.concat(e.detail.tag) });
    },

    onTagRemove(e) {
      const tags = this.data.draft.tags.filter((tag) => tag !== e.detail.tag);
      this.setData({ 'draft.tags': tags });
    },

    onConfirm() {
      this.triggerEvent('confirm', cloneFilter(this.data.draft));
    },

    onReset() {
      this.setData({
        'draft.subjectId': '',
        'draft.knowledgeId': '',
        'draft.questionType': [],
        'draft.mastery': [],
        'draft.tags': [],
        'draft.keyword': '',
        points: [],
      });
      this.triggerEvent('reset');
    },

    onClose() {
      this.triggerEvent('close');
    },
  },
});
