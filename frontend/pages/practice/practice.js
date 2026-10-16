const { themeBehavior } = require('../../behaviors/theme');
const practice = require('../../services/practice.service');
const mistake = require('../../services/mistake.service');
const { CORRECT, WRONG, LUCKY } = require('../../mock/mistakes');

const VERDICTS = { correct: CORRECT, wrong: WRONG, lucky: LUCKY };
const JUDGE_OPTIONS = ['对', '错'];

// 题干里的选项以 "A."/"B." 内联（数据模型无独立 options 字段），
// 按 A、B、C… 连续出现的标记切出正文与选项
function parseOptions(stem) {
  const re = /([A-Z])[.、．]\s*/g;
  const marks = [];
  let expect = 'A'.charCodeAt(0);
  let match;
  while ((match = re.exec(stem)) !== null) {
    if (match[1].charCodeAt(0) !== expect) continue;
    marks.push({ key: match[1], start: match.index, bodyStart: re.lastIndex });
    expect += 1;
  }
  if (marks.length < 2) return null;
  const options = marks.map((mark, i) => ({
    key: mark.key,
    text: stem
      .slice(mark.bodyStart, i + 1 < marks.length ? marks[i + 1].start : stem.length)
      .replace(/\s+$/, ''),
  }));
  return { stemText: stem.slice(0, marks[0].start).replace(/\s+$/, ''), options };
}

function fallbackOptions(answer) {
  const text = String(answer);
  let end = 'D'.charCodeAt(0);
  for (let code = 'A'.charCodeAt(0); code <= 'Z'.charCodeAt(0); code += 1) {
    if (text.indexOf(String.fromCharCode(code)) >= 0 && code > end) end = code;
  }
  const options = [];
  for (let code = 'A'.charCodeAt(0); code <= end; code += 1) {
    options.push({ key: String.fromCharCode(code), text: '' });
  }
  return options;
}

function buildQuestion(record) {
  const question = {
    id: record.id,
    questionType: record.questionType,
    stemText: record.stem,
    answer: record.answer,
    analysis: record.analysis,
  };
  if (record.questionType === '单选' || record.questionType === '多选') {
    const parsed = parseOptions(record.stem);
    if (parsed) {
      question.stemText = parsed.stemText;
      question.options = parsed.options;
    } else {
      question.options = fallbackOptions(record.answer);
    }
    question.answerText = String(record.answer);
  } else if (record.questionType === '判断') {
    question.options = JUDGE_OPTIONS.map((key) => ({ key, text: '' }));
    question.answerText = String(record.answer);
  } else if (record.questionType === '填空') {
    question.blankCount = record.answer.length;
    question.answerText = record.answer.join('　');
  } else {
    question.answerText = String(record.answer);
  }
  question.options = (question.options || []).map((option) =>
    Object.assign({}, option, { checked: false, state: '' }),
  );
  return question;
}

Page({
  behaviors: [themeBehavior],

  data: {
    current: null,
    index: 0,
    total: 0,
    selection: '',
    checks: [],
    blanks: [],
    revealed: false,
    result: null,
    locked: false,
    canSubmit: false,
  },

  async onLoad(query) {
    this.sessionId = query.sessionId;
    const { session } = await practice.sessionDetail(query.sessionId);
    const records = await Promise.all(session.mistakeIds.map((id) => mistake.get(id)));
    this.questions = records.map(buildQuestion);
    this.setData({ total: this.questions.length });
    this.showQuestion(0);
  },

  showQuestion(index) {
    const question = this.questions[index];
    this.setData({
      current: question,
      index,
      selection: '',
      checks: [],
      blanks: question.blankCount ? new Array(question.blankCount).fill('') : [],
      revealed: false,
      result: null,
      locked: false,
      canSubmit: false,
    });
  },

  markChosen(chosenKeys) {
    const options = this.data.current.options.map((option) =>
      Object.assign({}, option, { checked: chosenKeys.indexOf(option.key) >= 0 }),
    );
    this.setData({ 'current.options': options });
  },

  onRadioChange(e) {
    this.setData({ selection: e.detail.value, canSubmit: true });
    this.markChosen([e.detail.value]);
  },

  onCheckChange(e) {
    this.setData({ checks: e.detail.value, canSubmit: e.detail.value.length > 0 });
    this.markChosen(e.detail.value);
  },

  onBlankInput(e) {
    const blanks = this.data.blanks.slice();
    blanks[e.currentTarget.dataset.index] = e.detail.value;
    this.setData({ blanks, canSubmit: blanks.some((text) => text !== '') });
  },

  async onSubmit() {
    const { current, selection, checks } = this.data;
    let answer;
    if (current.questionType === '多选') {
      answer = checks.slice().sort().join('');
    } else if (current.questionType === '填空') {
      answer = this.data.blanks;
    } else {
      answer = selection;
    }
    const result = await practice.submitAnswer(this.sessionId, current.id, answer);
    this.setData({ result, locked: true });
    this.annotateOptions(answer);
  },

  // 红笔批注的语义：标准答案项描成功色，用户误选的项描失败色
  annotateOptions(answer) {
    const standard = String(this.data.current.answer);
    const chosen =
      this.data.current.questionType === '多选' ? answer : [answer];
    const options = this.data.current.options.map((option) => {
      const inStandard = standard.indexOf(option.key) >= 0;
      const picked = chosen.indexOf(option.key) >= 0;
      const state = inStandard ? 'correct' : picked ? 'wrong' : '';
      return Object.assign({}, option, { checked: option.checked || picked, state });
    });
    this.setData({ 'current.options': options });
  },

  onToggleAnswer() {
    this.setData({ revealed: !this.data.revealed });
  },

  async onSelfGrade(e) {
    const verdict = VERDICTS[e.currentTarget.dataset.verdict];
    await practice.submitAnswer(this.sessionId, this.data.current.id, verdict);
    if (this.data.index === this.data.total - 1) {
      this.finish();
    } else {
      this.showQuestion(this.data.index + 1);
    }
  },

  async onAdvance() {
    if (this.data.index === this.data.total - 1) {
      this.finish();
    } else {
      this.showQuestion(this.data.index + 1);
    }
  },

  async finish() {
    await practice.finishSession(this.sessionId);
    wx.redirectTo({
      url: '/pages/practice-result/practice-result?sessionId=' + this.sessionId,
    });
  },
});
