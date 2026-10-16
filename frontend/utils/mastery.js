const { CORRECT } = require('../mock/mistakes');

const UNMASTERED = '未掌握';
const PARTIAL = '部分掌握';
const MASTERED = '已掌握';

function computeMastery(logs) {
  const recent = logs
    .slice()
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 3);
  if (recent.length === 0) return UNMASTERED;
  const correct = recent.filter((log) => log.verdict === CORRECT).length;
  if (correct === 0) return UNMASTERED;
  if (correct === recent.length) return MASTERED;
  return PARTIAL;
}

module.exports = { computeMastery };
