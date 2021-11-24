/* eslint-disable no-shadow */
/* eslint-disable consistent-return */
/* eslint-disable no-await-in-loop */
// const { debug, apiCode, TYPE_MEDIA, ROLE } = require('@utils/constant');
// const { user, user_sale_info } = require('@models');

const hat = require('hat');
const Sequelize = require('sequelize');

const { Op } = Sequelize;
const fs = require('fs');

const pathConfig = require('@root/pathConfig');
const { key_ali } = require('@config/CFG');
const co = require('co');
const OSS = require('ali-oss');
const sequelize = require('../config/env');

async function upload(req, res) {
  const file = req.files;
  console.log(file);
  return uploadMedia(file.image);
}

async function saveImageOSS(file, name) {
  console.log(key_ali);
  const client = new OSS({
    region: key_ali.REGION,
    accessKeyId: key_ali.ALI_ACCESS_KEY_ID,
    accessKeySecret: key_ali.ALI_ACCESS_KEY_SECRET,
    bucket: key_ali.BUCKET,
  });
  const rest = await co(function* () {
    // use 'chunked encoding'
    const result = yield client.put(name, file.data);
    console.log(result);
    return result;
  }).catch((err) => {
    console.log(err);
  });
  return rest.name;
}
async function uploadMedia(file) {
  if (file) {
    console.log(file);
    const { mimetype } = file;
    const fileType = mimetype.replace('image/', '');
    const name = `${pathConfig.IMAGE_DB}/${hat()}.${fileType}`;
    // const nameSave = `${pathConfig.PUBLIC}/${name}`;
    // fs.writeFileSync(nameSave, file.data, (err, data) => {
    //   if (err) {
    //     console.log(err);
    //   }
    //   console.log('thành công');
    // });
    await saveImageOSS(file, name);
    return name;
  }
  return null;
}
async function checkImage(req, keys) {
  try {
    const file = req.files[keys];
    if (file[0]) {
      return file.length;
    }
    return 1;
  } catch (err) {
    return 0;
  }
}
async function uploadMediaWithName(req, keys) {
  try {
    if (req.files[keys]) {
      const file = req.files[keys];
      console.log(file);
      const { mimetype } = file;
      const fileType = mimetype.replace('image/', '');
      const name = `${pathConfig.IMAGE_DB}/${hat()}.${fileType}`;
      console.log(name);
      // const nameSave = `${pathConfig.PUBLIC}/${name}`;
      // fs.writeFileSync(nameSave, file.data, (err, data) => {
      //   if (err) {
      //     console.log(err);
      //   }
      //   console.log('thành công');
      // });
      await saveImageOSS(file, name);
      return name;
    }
    return null;
  } catch (ex) {
    console.log(ex);
    return '';
  }
}
async function uploadVideo(req, keys) {
  try {
    if (req.files[keys]) {
      console.log('đã vào đây');
      const file = req.files[keys];
      const { mimetype } = file;
      let fileType = mimetype.replace('video/', '');
      if (fileType == 'quicktime') {
        fileType = 'mp4';
      }
      const name = `${pathConfig.VIDEO_DB}/${hat()}.${fileType}`;
      // const nameSave = `${pathConfig.PUBLIC}/${name}`;
      // fs.writeFileSync(nameSave, file.data, (err, data) => {
      //   if (err) {
      //     console.log(err);
      //   }
      //   console.log('thành công');
      // });
      await saveImageOSS(file, name);
      return name;
    }
    return '';
  } catch (ex) {
    return '';
  }
}
async function removeMedia(name) {
  // fs.unlink('name', (err) => {
  //   if (err) return console.log(err);
  //   console.log('file deleted successfully');
  // });
}
async function testOss(req, res) {
  try {
    if (req.files.image) {
      console.log('đã vào đây');
      const file = req.files.image;
      const { mimetype } = file;
      let fileType = mimetype.replace('video/', '');
      if (fileType == 'quicktime') {
        fileType = 'mp4';
      }
      const name = `${pathConfig.VIDEO_DB}/${hat()}.${fileType}`;
      // const nameSave = `${pathConfig.PUBLIC}/${name}`;
      // fs.writeFileSync(nameSave, file.data, (err, data) => {
      //   if (err) {
      //     console.log(err);
      //   }
      //   console.log('thành công');
      // });
      await saveImageOSS(file, name);
      return name;
    }
    return '';
  } catch (ex) {
    return '';
  }
}

module.exports = {
  uploadMedia,
  upload,
  removeMedia,
  uploadVideo,
  uploadMediaWithName,
  checkImage,
  testOss,
};
