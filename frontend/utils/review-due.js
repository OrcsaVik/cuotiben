const DAY = 24 * 60 * 60 * 1000;
const THRESHOLD_DAYS = 7;

function lastTouch(mistake) {
  return mistake.lastReviewAt || mistake.createdAt;
}

function isDue(mistake, now, days = THRESHOLD_DAYS) {
  return now - lastTouch(mistake) > days * DAY;
}

function overdueDays(mistake, now) {
  return Math.floor((now - lastTouch(mistake)) / DAY) - THRESHOLD_DAYS;
}

module.exports = { isDue, overdueDays };
