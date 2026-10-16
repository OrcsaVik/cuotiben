const storage = require('./storage');
const { judge } = require('../utils/judge');
const { computeMastery } = require('../utils/mastery');
const { CORRECT, WRONG, LUCKY } = require('../mock/mistakes');

const UNMASTERED = '未掌握';

function genSessionId() {
  return 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function sortedLogs() {
  return storage.get('reviewLogs', []).slice().sort((a, b) => a.createdAt - b.createdAt);
}

// 种子日志不存掌握度快照，结果页的前后值只能按时间轴逐条重放算出
function replay(logs) {
  const history = [];
  const state = new Map();
  logs.forEach((log) => {
    history.push(log);
    const before = state.get(log.mistakeId) || UNMASTERED;
    const after = computeMastery(history.filter((item) => item.mistakeId === log.mistakeId));
    state.set(log.mistakeId, after);
    state.set(log.id, { before, after });
  });
  return state;
}

function createSession(mistakeIds) {
  const startedAt = Date.now();
  const session = {
    id: genSessionId(),
    mistakeIds,
    startedAt,
    finishedAt: null,
    durationMs: null,
  };
  const sessions = storage.get('sessions', []);
  sessions.push(session);
  storage.set('sessions', sessions);
  return Promise.resolve({ id: session.id, mistakeIds, startedAt });
}

function submitAnswer(sessionId, mistakeId, answer) {
  const mistakes = storage.get('mistakes', []);
  const mistake = mistakes.find((item) => item.id === mistakeId);
  let correct;
  let verdict;
  if (mistake.questionType === '解答') {
    verdict = answer;
    correct = verdict === CORRECT;
  } else {
    correct = judge(mistake.questionType, answer, mistake.answer);
    verdict = correct ? CORRECT : WRONG;
  }
  const createdAt = Date.now();
  const log = {
    id: sessionId + '-' + mistakeId + '-' + createdAt,
    sessionId,
    mistakeId,
    userAnswer: answer,
    verdict,
    createdAt,
  };
  const masteryBefore = mistake.mastery || UNMASTERED;
  const masteryAfter = computeMastery(
    storage.get('reviewLogs', []).concat(log).filter((item) => item.mistakeId === mistakeId),
  );
  mistake.mastery = masteryAfter;
  mistake.reviewCount = (mistake.reviewCount || 0) + 1;
  mistake.lastReviewAt = createdAt;
  storage.set('mistakes', mistakes);
  storage.set('reviewLogs', storage.get('reviewLogs', []).concat(log));
  return Promise.resolve({ correct, verdict, masteryBefore, masteryAfter });
}

function finishSession(sessionId) {
  const sessions = storage.get('sessions', []);
  const session = sessions.find((item) => item.id === sessionId);
  const logs = sortedLogs();
  const sessionLogs = logs.filter((log) => log.sessionId === sessionId);
  const counts = { correct: 0, wrong: 0, lucky: 0 };
  sessionLogs.forEach((log) => {
    if (log.verdict === CORRECT) counts.correct += 1;
    else if (log.verdict === LUCKY) counts.lucky += 1;
    else counts.wrong += 1;
  });
  const accuracy = sessionLogs.length === 0 ? 0 : counts.correct / sessionLogs.length;
  const state = replay(logs);
  const changes = [];
  const seen = new Set();
  sessionLogs.forEach((log) => {
    const pair = state.get(log.id);
    if (pair.before !== pair.after && !seen.has(log.mistakeId)) {
      seen.add(log.mistakeId);
      changes.push({ mistakeId: log.mistakeId, before: pair.before, after: pair.after });
    }
  });
  const finishedAt = Date.now();
  session.finishedAt = finishedAt;
  session.durationMs = finishedAt - session.startedAt;
  storage.set('sessions', sessions);
  return Promise.resolve({ accuracy, counts, changes, durationMs: session.durationMs });
}

function listSessions() {
  const logs = storage.get('reviewLogs', []);
  const rows = storage
    .get('sessions', [])
    .slice()
    .sort((a, b) => (b.finishedAt || b.startedAt) - (a.finishedAt || a.startedAt))
    .map((session) => {
      const items = logs.filter((log) => log.sessionId === session.id);
      const correct = items.filter((log) => log.verdict === CORRECT).length;
      return {
        id: session.id,
        finishedAt: session.finishedAt || null,
        total: items.length,
        correct,
        accuracy: items.length === 0 ? 0 : correct / items.length,
      };
    });
  return Promise.resolve(rows);
}

function sessionDetail(sessionId) {
  const session = storage.get('sessions', []).find((item) => item.id === sessionId);
  const mistakes = storage.get('mistakes', []);
  const state = replay(sortedLogs());
  const items = sortedLogs()
    .filter((log) => log.sessionId === sessionId)
    .map((log) => {
      const pair = state.get(log.id);
      return {
        mistakeId: log.mistakeId,
        stem: mistakes.find((item) => item.id === log.mistakeId).stem,
        verdict: log.verdict,
        masteryBefore: pair.before,
        masteryAfter: pair.after,
      };
    });
  return Promise.resolve({ session, items });
}

function redoWrong(sessionId) {
  const mistakeIds = storage
    .get('reviewLogs', [])
    .filter((log) => log.sessionId === sessionId && log.verdict === WRONG)
    .map((log) => log.mistakeId);
  return createSession(mistakeIds);
}

module.exports = {
  createSession,
  submitAnswer,
  finishSession,
  listSessions,
  sessionDetail,
  redoWrong,
};
