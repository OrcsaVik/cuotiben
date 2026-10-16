const storage = require('./storage');
const category = require('./category.service');
const { isDue, overdueDays } = require('../utils/review-due');
const { weekStart } = require('../utils/date');

const UNMASTERED = '未掌握';
const PARTIAL = '部分掌握';
const MASTERED = '已掌握';

function overview() {
  const mistakes = storage.get('mistakes', []);
  const total = mistakes.length;
  const from = weekStart();
  const weekAdded = mistakes.filter((item) => item.createdAt >= from).length;
  const masteryCounts = { [UNMASTERED]: 0, [PARTIAL]: 0, [MASTERED]: 0 };
  mistakes.forEach((item) => {
    masteryCounts[item.mastery || UNMASTERED] += 1;
  });
  const masteryRatios = {};
  [UNMASTERED, PARTIAL, MASTERED].forEach((level) => {
    masteryRatios[level] = total === 0 ? 0 : masteryCounts[level] / total;
  });
  return Promise.resolve({ total, weekAdded, masteryCounts, masteryRatios });
}

function subjectDistribution(top = 5) {
  const mistakes = storage.get('mistakes', []);
  const counts = new Map();
  mistakes.forEach((item) => {
    counts.set(item.subjectId, (counts.get(item.subjectId) || 0) + 1);
  });
  return category.listSubjects().then((subjects) => {
    const names = new Map(subjects.map((subject) => [subject.id, subject.name]));
    return [...counts.entries()]
      .map(([subjectId, count]) => ({ subjectId, subjectName: names.get(subjectId) || '', count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, top);
  });
}

function pendingReview(now = Date.now()) {
  const mistakes = storage.get('mistakes', []);
  const logs = storage.get('reviewLogs', []);
  const latestLog = new Map();
  logs.forEach((log) => {
    const current = latestLog.get(log.mistakeId);
    if (!current || log.createdAt > current) latestLog.set(log.mistakeId, log.createdAt);
  });
  const due = mistakes
    .map((mistake) => {
      const last = mistake.lastReviewAt || latestLog.get(mistake.id);
      const effective = last ? Object.assign({}, mistake, { lastReviewAt: last }) : mistake;
      return { mistake: effective, overdueDays: overdueDays(effective, now) };
    })
    .filter((entry) => isDue(entry.mistake, now))
    .sort((a, b) => b.overdueDays - a.overdueDays);
  return Promise.resolve(due);
}

module.exports = { overview, subjectDistribution, pendingReview };
