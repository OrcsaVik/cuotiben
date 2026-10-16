Component({
  options: {
    addGlobalClass: true,
  },

  properties: {
    tags: { type: Array, value: [] },
    placeholder: { type: String, value: '输入标签' },
  },

  data: {
    draft: '',
  },

  methods: {
    onInput(e) {
      this.setData({ draft: e.detail.value });
    },

    onAdd() {
      const tag = this.data.draft.trim();
      if (!tag || this.data.tags.indexOf(tag) >= 0) return;
      this.triggerEvent('add', { tag });
      this.setData({ draft: '' });
    },

    onRemove(e) {
      this.triggerEvent('remove', { tag: e.currentTarget.dataset.tag });
    },
  },
});
