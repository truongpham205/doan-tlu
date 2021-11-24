/* eslint-disable no-extend-native */
/* eslint-disable no-param-reassign */
const { key_ali } = require('@config/CFG');
const stringUtil = require('./stringUtil.js');

function round(num, scale) {
  const block = num % scale;
  num = block > 0 ? num - (num % scale) + scale : num;
  return num;
}

function format(num) {
  return new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: 0,
  }).format(num);
}

function generatePassword(passwordLength) {
  const numberChars = '0123456789';
  const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
  const specialCharacters = "!#$%&'()*+,-./:;<=>?@[]^_`{|}~";
  const allChars = numberChars + upperChars + lowerChars;
  let randPasswordArray = Array(passwordLength);
  randPasswordArray[0] = numberChars;
  randPasswordArray[1] = upperChars;
  randPasswordArray[2] = lowerChars;
  randPasswordArray[3] = specialCharacters;
  randPasswordArray = randPasswordArray.fill(allChars, 4);
  return shuffleArray(randPasswordArray.map((x) => x[Math.floor(Math.random() * x.length)])).join('');
}

Date.prototype.addHours = function (h) {
  this.setTime(this.getTime() + h * 60 * 60 * 1000);
  return this;
};

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}
function normalizePhone(phone, usingCountryCode = false) {
  if (!phone) {
    return '';
  }
  let normalizedPhone = phone.replace(/[^0-9+;]/gi, '');
  if (normalizedPhone.startsWith('+84')) {
    normalizedPhone = normalizedPhone.replace(/^\+84/gi, 0);
  }
  if (/^84\d{9,10}/i.test(normalizedPhone)) {
    normalizedPhone = normalizedPhone.replace(/^84/gi, '0');
  }

  normalizedPhone = normalizedPhone.replace(/[^0-9]/gi, '');
  if (usingCountryCode) {
    return normalizedPhone.replace(/^(0)/gi, '84');
  }
  return normalizedPhone.replace(/^(84)/gi, '0');
}

/**
 * Convert arrays to object with keys by keyExtractorCallback
 * @param {array} items
 * @param {function} keyExtractorCallback
 */
function convertArrayToObject(items, keyExtractorCallback) {
  if (!keyExtractorCallback) {
    return null;
  }
  const obj = {};
  items.forEach((v) => {
    const k = keyExtractorCallback(v);
    if (!k) {
      return;
    }
    obj[k] = v;
  });

  return obj;
}

module.exports = {
  ...stringUtil,
  formatNumber: (num) => format(num),
  generatePasswordReset: () => generatePassword(8),
  roundNumber: (num, scale) => round(num, scale),
  normalizePhone,
  convertArrayToObject,
  getUrl: (req) => `${key_ali.ALI_URL}`,
};
