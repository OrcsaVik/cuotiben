const { themeBehavior } = require('../../behaviors/theme');
const category = require('../../services/category.service');
const mistake = require('../../services/mistake.service');

const QUESTION_TYPES = ['单选', '多选', '填空', '判断', '解答'];
const OPTIONS = ['A', 'B', 'C', 'D'];
const JUDGEMENTS = ['对', '错'];
const DETAIL_URL = '/pages/mistake-detail/mistake-detail';
const TOAST_MS = 700;

function answerField(questionType) {
  if (questionType === '单选' || questionType === '多选') {
    return { answerChoices: OPTIONS, answerPlaceholder: '' };
  }
  if (questionType === '判断') {
    return { answerChoices: JUDGEMENTS, answerPlaceholder: '' };
  }
  if (questionType === '填空') {
    return { answerChoices: [], answerPlaceholder: '一行一个空，按顺序填写' };
  }
  return { answerChoices: [], answerPlaceholder: '参考答案，重做后对照' };
}

function answerToText(answer, questionType) {
  if (!Array.isArray(answer)) return answer;
  return answer.join(questionType === '填空' ? '\n' : '');
}

function answerToValue(text, questionType) {
  if (questionType !== '填空') return text;
  return text.split('\n').filter((line) => line.trim() !== '');
}

Page({
  behaviors: [themeBehavior],

  data: {
    id: '',
    imagePath: '',
    stem: '',
    stemPlaceholder: '填写题干',
    focusStem: false,
    subjects: [],
    points: [],
    subjectId: '',
    knowledgeId: '',
    questionTypes: QUESTION_TYPES,
    questionType: '',
    answerChoices: [],
    answerPlaceholder: '',
    answer: '',
    analysis: '',
    tags: [],
    tips: { show: false, msg: '' },
  },

  async onLoad(options) {
    this.setData({ subjects: await category.listSubjects() });
    if (options.id) {
      await this.fillForEdit(options.id);
      return;
    }
    const ocrText = options.ocrText ? decodeURIComponent(options.ocrText) : '';
    this.setData({
      imagePath: options.imagePath ? decodeURIComponent(options.imagePath) : '',
      stem: ocrText,
      stemPlaceholder: ocrText ? '识别结果可继续修改' : '未能识别，请手动输入',
      focusStem: !ocrText,
    });
    wx.setNavigationBarTitle({ title: '录入错题' });
  },

  async fillForEdit(id) {
    const record = await mistake.get(id);
    this.setData(
      Object.assign(
        {
          id: record.id,
          imagePath: record.imagePath,
          stem: record.stem,
          subjectId: record.subjectId,
          knowledgeId: record.knowledgeId,
          questionType: record.questionType,
          answer: answerToText(record.answer, record.questionType),
          analysis: record.analysis,
          tags: record.tags,
        },
        answerField(record.questionType),
      ),
    );
    this.setData({ points: await category.listPoints(record.subjectId) });
  },

  onStemInput(e) {
    this.setData({ stem: e.detail.value });
  },

  onStemBlur() {
    this.setData({ focusStem: false });
  },

  onSubjectChange(e) {
    const subjectId = e.detail.subjectId;
    this.setData({ subjectId, knowledgeId: '', points: [] });
    category.listPoints(subjectId).then((points) => this.setData({ points }));
  },

  onPointChange(e) {
    this.setData({ knowledgeId: e.detail.pointId });
  },

  onTypeTap(e) {
    const questionType = e.currentTarget.dataset.value;
    if (questionType === this.data.questionType) return;
    this.setData(Object.assign({ questionType, answer: '' }, answerField(questionType)));
  },

  onAnswerInput(e) {
    this.setData({ answer: e.detail.value });
  },

  onAnswerOptionTap(e) {
    const value = e.currentTarget.dataset.value;
    if (this.data.questionType !== '多选') {
      this.setData({ answer: value });
      return;
    }
    const kept = this.data.answer.split('').filter((letter) => letter !== value);
    this.setData({ answer: kept.concat(value).sort().join('') });
  },

  onAnalysisInput(e) {
    this.setData({ analysis: e.detail.value });
  },

  onTagAdd(e) {
    this.setData({ tags: this.data.tags.concat(e.detail.tag) });
  },

  onTagRemove(e) {
    this.setData({ tags: this.data.tags.filter((tag) => tag !== e.detail.tag) });
  },

  onPreviewImage() {
    wx.previewImage({ urls: [this.data.imagePath] });
  },

  onTipsHidden() {
    this.setData({ 'tips.show': false });
  },

  missingField() {
    const form = this.data;
    if (!form.stem.trim()) return '请填写题干';
    if (!form.subjectId) return '请选择科目';
    if (!form.knowledgeId) return '请选择知识点';
    if (!form.questionType) return '请选择题型';
    if (form.questionType !== '解答' && !form.answer.trim()) return '请填写答案';
    return '';
  },

  async onSave() {
    const missing = this.missingField();
    if (missing) {
      this.setData({ 'tips.msg': missing, 'tips.show': true });
      return;
    }
    const form = this.data;
    const record = {
      stem: form.stem,
      imagePath: form.imagePath,
      subjectId: form.subjectId,
      knowledgeId: form.knowledgeId,
      questionType: form.questionType,
      answer: answerToValue(form.answer, form.questionType),
      analysis: form.analysis,
      tags: form.tags,
    };
    const saved = form.id
      ? await mistake.update(form.id, record)
      : await mistake.create(record);
    wx.showToast({ title: '已保存', icon: 'success', duration: TOAST_MS });
    setTimeout(() => wx.redirectTo({ url: DETAIL_URL + '?id=' + saved.id }), TOAST_MS);
  },
});
