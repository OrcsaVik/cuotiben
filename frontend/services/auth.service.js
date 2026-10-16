const storage = require('./storage');

// 登录态目前只落在本机 storage。将来接云数据库时，页面层不动，只替换本文件的实现。
function getProfile() {
  return Promise.resolve(storage.get('profile', null));
}

function signIn(input) {
  const profile = {
    nickName: (input.nickName || '').trim(),
    avatarUrl: input.avatarUrl || '',
    signedInAt: Date.now(),
  };
  storage.set('profile', profile);
  return Promise.resolve(profile);
}

function signOut() {
  storage.remove('profile');
  return Promise.resolve();
}

module.exports = { getProfile, signIn, signOut };
