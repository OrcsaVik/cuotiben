const { bootstrap } = require('./mock/seed');

App({
  globalData: {
    applySubjectId: '',
    loginPromptDismissed: false,
  },

  onLaunch() {
    bootstrap();
  },
});
