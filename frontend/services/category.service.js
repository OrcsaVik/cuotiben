const categories = require('../mock/categories');

function listSubjects() {
  return Promise.resolve(
    categories.map((subject) => ({ id: subject.id, name: subject.name })),
  );
}

function listPoints(subjectId) {
  const subject = categories.find((item) => item.id === subjectId);
  return Promise.resolve(subject ? subject.points : []);
}

function resolve(subjectId, pointId) {
  const subject = categories.find((item) => item.id === subjectId);
  const point = subject ? subject.points.find((item) => item.id === pointId) : undefined;
  return Promise.resolve({
    subjectName: subject ? subject.name : '',
    pointName: point ? point.name : '',
  });
}

module.exports = { listSubjects, listPoints, resolve };
