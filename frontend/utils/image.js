function saveToUserData(tempFilePath) {
  const match = /\.(\w{3,4})$/.exec(tempFilePath);
  const ext = match ? match[1] : 'jpg';
  const destPath = wx.env.USER_DATA_PATH + '/img-' + Date.now() + '.' + ext;
  return new Promise((resolve) => {
    wx.getFileSystemManager().saveFile({
      tempFilePath,
      filePath: destPath,
      success: () => resolve(destPath),
      // 转存失败时退回临时路径：挂住的 Promise 会让页面永久卡住，比只在本次运行有效的路径更糟。
      fail: () => resolve(tempFilePath),
    });
  });
}

function checkSize(path, maxMB = 10) {
  return new Promise((resolve) => {
    wx.getFileInfo({
      filePath: path,
      success: (res) => resolve(res.size <= maxMB * 1024 * 1024),
    });
  });
}

module.exports = { saveToUserData, checkSize };
