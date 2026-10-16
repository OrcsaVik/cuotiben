const DAY = 24 * 60 * 60 * 1000;

function pad(n) {
  return n < 10 ? '0' + n : String(n);
}

function formatDate(value) {
  const d = new Date(value);
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

function relativeDays(timestamp, now = Date.now()) {
  return Math.floor((now - timestamp) / DAY);
}

function weekStart(now = Date.now()) {
  const d = new Date(now);
  const sinceMonday = (d.getDay() + 6) % 7;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - sinceMonday);
  return d.getTime();
}

// 9~12 月与次年 1~2 月归秋季学期（9 月 1 日起），3~8 月归春季学期（3 月 1 日起）
function semesterStart(now = Date.now()) {
  const d = new Date(now);
  if (d.getMonth() >= 8) return new Date(d.getFullYear(), 8, 1).getTime();
  if (d.getMonth() >= 2) return new Date(d.getFullYear(), 2, 1).getTime();
  return new Date(d.getFullYear() - 1, 8, 1).getTime();
}

function dayStart(dateString) {
  const parts = dateString.split('-');
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).getTime();
}

function dayEnd(dateString) {
  return dayStart(dateString) + DAY - 1;
}

module.exports = { formatDate, relativeDays, weekStart, semesterStart, dayStart, dayEnd };
