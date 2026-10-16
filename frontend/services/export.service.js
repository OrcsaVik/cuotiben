const mistake = require('./mistake.service');

function count(filter) {
  return mistake.countBy(filter);
}

function buildPdf(filter) {
  const destPath = wx.env.USER_DATA_PATH + '/mistakes-export-' + Date.now() + '.pdf';
  return new Promise((resolve) => {
    wx.getFileSystemManager().copyFile({
      srcPath: '/mock/placeholder.pdf',
      destPath,
      success: () => resolve({ path: destPath }),
    });
  });
}

module.exports = { count, buildPdf };
