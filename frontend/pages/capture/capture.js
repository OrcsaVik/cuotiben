const { themeBehavior } = require('../../behaviors/theme');
const ocr = require('../../services/ocr.service');
const image = require('../../utils/image');

const MAX_MB = 10;
const EDIT_URL = '/pages/mistake-edit/mistake-edit';

Page({
  behaviors: [themeBehavior],

  data: {
    imagePath: '',
    recognizing: false,
  },

  onShow() {
    this.getTabBar().setData({ selected: 2 });
  },

  onCamera() {
    this.pick(['camera']);
  },

  onAlbum() {
    this.pick(['album']);
  },

  async pick(sourceType) {
    const chosen = await new Promise((resolve) => {
      wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType,
        sizeType: ['compressed'],
        success: resolve,
      });
    });
    const tempPath = chosen.tempFiles[0].tempFilePath;
    const fits = await image.checkSize(tempPath, MAX_MB);
    if (!fits) {
      wx.showToast({ title: '图片超过 10MB，换一张再试', icon: 'none' });
      return;
    }
    // tempFilePath 只在本次运行内有效，重启即失效，记录里只能存转存后的路径
    const savedPath = await image.saveToUserData(tempPath);
    this.setData({ imagePath: savedPath, recognizing: true });
    wx.showLoading({ title: '识别中', mask: true });
    const result = await ocr.recognize(savedPath);
    wx.hideLoading();
    this.setData({ recognizing: false });
    wx.navigateTo({
      url:
        EDIT_URL +
        '?imagePath=' + encodeURIComponent(savedPath) +
        '&ocrText=' + encodeURIComponent(result.text),
      success: () => this.setData({ imagePath: '' }),
    });
  },

  onPreview() {
    wx.previewImage({ urls: [this.data.imagePath] });
  },
});
