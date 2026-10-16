Component({
  properties: {
    subjects: { type: Array, value: [] },
    points: { type: Array, value: [] },
    subjectId: { type: String, value: '' },
    pointId: { type: String, value: '' },
  },

  methods: {
    onSubjectChange(e) {
      const subject = this.data.subjects[e.detail.value];
      if (subject) this.triggerEvent('subjectchange', { subjectId: subject.id });
    },

    onPointChange(e) {
      const point = this.data.points[e.detail.value];
      if (point) this.triggerEvent('pointchange', { pointId: point.id });
    },
  },
});
