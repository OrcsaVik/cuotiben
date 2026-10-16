function normalize(s) {
  let out = '';
  const text = String(s);
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    if (code === 0x3000) out += ' ';
    else if (code >= 0xff01 && code <= 0xff5e) out += String.fromCharCode(code - 0xfee0);
    else out += text[i];
  }
  return out.replace(/\s+/g, '').trim();
}

function optionSet(value) {
  const text = Array.isArray(value) ? value.join('') : String(value);
  return text
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .split('')
    .sort()
    .join('');
}

function judge(questionType, answer, standard) {
  if (questionType === '单选' || questionType === '判断') {
    return answer === standard;
  }
  if (questionType === '多选') {
    return optionSet(answer) === optionSet(standard);
  }
  if (questionType === '填空') {
    const blanks = Array.isArray(answer) ? answer : [answer];
    const expect = Array.isArray(standard) ? standard : [standard];
    return (
      blanks.length === expect.length &&
      blanks.every((item, index) => normalize(item) === normalize(expect[index]))
    );
  }
  return false;
}

module.exports = { normalize, judge };
