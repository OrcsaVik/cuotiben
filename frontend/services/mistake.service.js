const storage = require('./storage');

const UNMASTERED = '未掌握';

function all() {
  return storage.get('mistakes', []);
}

function logs() {
  return storage.get('reviewLogs', []);
}

function genId() {
  return 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function byNewest(a, b) {
  return b.createdAt - a.createdAt;
}

function effectiveMastery(record) {
  return record.mastery || UNMASTERED;
}

// 种子记录不带 mastery/reviewCount/lastReviewAt，读出来一律补齐，
// 否则页面拿到的字段是 undefined，徽标和复习次数会静默空掉。
function hydrate(record) {
  return Object.assign({ reviewCount: 0, lastReviewAt: null, mastery: UNMASTERED }, record);
}

function matches(record, filter) {
  if (filter.subjectId && record.subjectId !== filter.subjectId) return false;
  if (filter.subjectIds.length && filter.subjectIds.indexOf(record.subjectId) < 0) return false;
  if (filter.startAt && record.createdAt < filter.startAt) return false;
  if (filter.endAt && record.createdAt > filter.endAt) return false;
  if (filter.knowledgeId && record.knowledgeId !== filter.knowledgeId) return false;
  if (filter.questionType.length && filter.questionType.indexOf(record.questionType) < 0) return false;
  if (filter.mastery.length && filter.mastery.indexOf(effectiveMastery(record)) < 0) return false;
  if (filter.tags.length) {
    const hit = record.tags.some((tag) => filter.tags.indexOf(tag) >= 0);
    if (!hit) return false;
  }
  if (filter.keyword) {
    if (record.stem.toLowerCase().indexOf(filter.keyword.toLowerCase()) < 0) return false;
  }
  return true;
}

function normalizeFilter(filter) {
  const f = filter || {};
  return {
    subjectId: f.subjectId || '',
    subjectIds: f.subjectIds || [],
    startAt: f.startAt || 0,
    endAt: f.endAt || 0,
    knowledgeId: f.knowledgeId || '',
    questionType: f.questionType || [],
    mastery: f.mastery || [],
    tags: f.tags || [],
    keyword: f.keyword || '',
  };
}

function filtered(filter) {
  const f = normalizeFilter(filter);
  return all()
    .filter((record) => matches(record, f))
    .sort(byNewest)
    .map(hydrate);
}

function list() {
  return Promise.resolve(all().slice().sort(byNewest).map(hydrate));
}

function get(id) {
  const record = all().find((item) => item.id === id);
  return Promise.resolve(record ? hydrate(record) : null);
}

function create(record) {
  const created = Object.assign(
    {
      id: genId(),
      createdAt: Date.now(),
      reviewCount: 0,
      lastReviewAt: null,
      mastery: UNMASTERED,
    },
    record,
  );
  const mistakes = all();
  mistakes.push(created);
  storage.set('mistakes', mistakes);
  return Promise.resolve(created);
}

function update(id, patch) {
  const mistakes = all();
  const record = mistakes.find((item) => item.id === id);
  Object.assign(record, patch);
  storage.set('mistakes', mistakes);
  return Promise.resolve(record);
}

function remove(id) {
  storage.set('mistakes', all().filter((item) => item.id !== id));
  storage.set('reviewLogs', logs().filter((log) => log.mistakeId !== id));
  return Promise.resolve();
}

function query(filter, page) {
  const p = page || {};
  const limit = p.limit === undefined ? 20 : p.limit;
  const offset = p.offset || 0;
  const records = filtered(filter);
  const items = records.slice(offset, offset + limit);
  return Promise.resolve({
    items,
    total: records.length,
    hasMore: offset + items.length < records.length,
  });
}

function countBy(filter) {
  return Promise.resolve(filtered(filter).length);
}

module.exports = { list, get, create, update, remove, query, countBy };
