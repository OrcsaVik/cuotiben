Component({
  // app.wxss 的 .chip 原语要落到组件内部的 text 上，默认 isolated 拿不到
  options: {
    addGlobalClass: true,
  },
  properties: {
    mistake: {
      type: Object,
      value: {},
    },
    // null = 普通模式不渲染勾选控件；Boolean = 多选模式下的勾选态
    selected: {
      type: null,
      value: null,
    },
    thumb: {
      type: Boolean,
      value: true,
    },
  },

  methods: {
    onRowTap() {
      this.triggerEvent('tap', { id: this.data.mistake.id });
    },
    onCheckTap() {
      this.triggerEvent('check', { id: this.data.mistake.id });
    },
  },
});
