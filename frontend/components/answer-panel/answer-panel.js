Component({
  options: {
    addGlobalClass: true,
  },

  properties: {
    answer: {
      type: String,
      value: '',
    },
    analysis: {
      type: String,
      value: '',
    },
    revealed: {
      type: Boolean,
      value: false,
    },
  },

  methods: {
    onToggle() {
      this.triggerEvent('toggle', { revealed: !this.data.revealed });
    },
  },
});
