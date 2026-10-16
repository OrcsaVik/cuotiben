Component({
  // 全局 .btn / .btn-ghost 原语要落到组件内部的 button 上，默认 isolated 拿不到 app.wxss
  options: {
    addGlobalClass: true,
  },
  properties: {
    icon: {
      type: String,
      value: 'info',
    },
    text: {
      type: String,
      value: '',
    },
    action: {
      type: String,
      value: '',
    },
  },
  methods: {
    onAction() {
      this.triggerEvent('action');
    },
  },
});
