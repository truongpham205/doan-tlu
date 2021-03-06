/* eslint-disable no-param-reassign */
/* eslint-disable operator-linebreak */
/* eslint-disable max-len */
/* eslint-disable default-case */
const { IS_ACTIVE, NOTI_TYPE, SOCKET_URL } = require('@utils/constant');
const { notification, user, order } = require('@models');
const { onesignal } = require('@config/CFG');
const Sequelize = require('sequelize');
const axios = require('axios');

const { Op } = Sequelize;

const sequelize = require('../config/env');

async function sendOnesignal({ content, player_ids, data }) {
  const dataOnsignal = {
    app_id: onesignal.APP_ID,
    data,
    contents: {
      en: content,
    },
    android_channel_id: onesignal.CHANNEL_ID,
    include_player_ids: player_ids,
  };
  axios.defaults.baseURL = onesignal.LINK;
  axios.defaults.headers.common.Authorization = `Basic :${onesignal.API_KEY}`;
  axios.defaults.headers.post['Content-Type'] = 'application/json';

  const a = await axios.post('/v1/notifications', dataOnsignal);
  return a.data;
}
async function pushSocket({ job_id, user_id, type, context }) {
  const url = `${SOCKET_URL}?job_id=${job_id}&user_id=${user_id}&type=${type}&content=${context}`;
  console.log(url);
  axios.defaults.baseURL = SOCKET_URL;
  const a = await axios.get('/socketio', {
    params: {
      job_id,
      user_id,
      type,
      context,
    },
  });
  return a.data;
}

async function createNotification({ user_id, metaData, type, context }) {
  try {
    const findUser = await user.findOne({ where: { id: user_id, is_active: IS_ACTIVE.ACTIVE } });
    if (findUser) {
      const data = await createTitleAndContent({ type, context });
      console.log(data);
      metaData.type = type;
      metaData.user_id = user_id;
      const metadataStr = JSON.stringify(metaData);
      console.log(metadataStr);

      await notification.create({
        user_id,
        meta_data: metadataStr,
        type,
        title: data.title,
        content: data.content,
        status: 1,
      });

      const player_ids = [findUser.device_id];
      if (findUser.device_id) {
        await sendOnesignal({ content: data.content, player_ids, data: metaData });
        await pushSocket({ job_id: metaData.job_id, user_id, type, context });
      }
    }
  } catch (err) {
    console.log(err);
  }
}
async function createNotificationWithTransaction({ user_id, metaData, type, context }, { transaction = null }) {
  try {
    const findUser = await user.findOne({ where: { id: user_id, is_active: IS_ACTIVE.ACTIVE } });
    if (findUser) {
      const data = await createTitleAndContent({ type, context });
      console.log(data);
      metaData.type = type;
      const metadataStr = JSON.stringify(metaData);
      console.log(metadataStr);
      await notification.create(
        {
          user_id,
          meta_data: metadataStr,
          type,
          title: data.title,
          content: data.content,
          status: 1,
        },
        { transaction }
      );

      const player_ids = [findUser.device_id];
      if (findUser.device_id) {
        await sendOnesignal({ content: data.content, player_ids, data: metaData });
        await pushSocket({ job_id: metaData.job_id, user_id, type, context });
      }
    }
  } catch (err) {
    console.log(err);
  }
}
async function createMultiNotification({ user_ids, metaData, type, context }) {
  try {
    const findUser = await user.findAll({ where: { id: { [Op.in]: user_ids }, is_active: IS_ACTIVE.ACTIVE } });
    if (findUser.length > 0) {
      const data = await createTitleAndContent({ type, context });
      console.log(data);
      metaData.type = type;
      const metadataStr = JSON.stringify(metaData);
      const listNoti = findUser.map((v) => ({
        user_id: v.id,
        meta_data: metadataStr,
        type,
        title: data.title,
        content: data.content,
        status: 1,
      }));
      await notification.bulkCreate(listNoti);
      const player_ids = findUser.filter.filter((u) => u.device_id && u.device_id.length > 10).map((u) => u.device_id);
      if (listNoti.length > 0) {
        await sendOnesignal({ header: data.title, content: data.content, player_ids, data: metaData });
      }
    }
  } catch (err) {
    console.log(err);
  }
}
async function createTitleAndContent({ type, context = '' }) {
  let content = '';
  switch (type) {
    case NOTI_TYPE.CAN_PAYMENT:
      content = `B???n c?? th??? thanh to??n cho ????n: ${context}`;
      break;
    case NOTI_TYPE.USER_HISTORY:
      content = context;
      break;
    case NOTI_TYPE.ASIGNED:
      content = `B???n ???????c ch??? ?????nh cho ????n: ${context}`;
      break;
    case NOTI_TYPE.CANCEL:
      content = `????n: ${context} c???a b???n ???? b??? h???y`;
      break;
    case NOTI_TYPE.NEWS:
      content = context;
      break;
    case NOTI_TYPE.DESPOSIT:
      content = `Kh??ch h??ng ????n: ${context} ???? ?????t c???c`;
      break;
    case NOTI_TYPE.DESPOSIT_CUSTOMER:
      content = 'Qu?? kh??ch ???? chuy???n kho???n th??nh c??ng. H??y ?????i th??ng tin x??c nh???n c???a ch??ng t??i.';
      break;
    case NOTI_TYPE.ACCEPT_FOR_DESPOSIT:
      content = `B???n c?? th??? ?????t c???c cho ????n: ${context}`;
      break;
    case NOTI_TYPE.DESPOSIT_SUCCESS:
      content = 'Ch??ng t??i d?? nh???n ????? s??? ti???n ?????t c???c c???a b???n';
      break;
    case NOTI_TYPE.CAN_CHECK_IN:
      content = 'Ch??ng t??i d?? nh???n ????? s??? ti???n d???ch v??? c???a b???n, ch??c b???n c?? m???t k??? ngh??? vui v???';
      break;
    case NOTI_TYPE.TRANSACTION_OF_PROVIDER:
      content = `C?? m???t ????n m???i: ${context}`;
      break;
    case NOTI_TYPE.NEW_ORDER:
      content = context;
      break;
    case NOTI_TYPE.SUCCESS:
      content = `????n: ${context} c???a b???n ???? ???????c ho??n th??nh`;
      break;
  }
  return { content };
}

async function createNoti(req, res) {
  const { order_id, type, content, metaData, type_noti } = req.body;
  const metadataStr = JSON.stringify(metaData);
  const findOrder = await order.findOne({ where: { id: order_id } });
  let user_id;
  if (type === 1) {
    user_id = findOrder.sale_leader_id;
  } else {
    user_id = findOrder.customer_id;
  }
  if (type == 1) {
    await notification.create({
      meta_data: metadataStr,
      type: type_noti,
      content,
      status: 1,
    });
  }
  if (user_id) {
    await notification.create({
      user_id,
      meta_data: metadataStr,
      type: type_noti,
      content,
      status: 1,
    });
  }
}
module.exports = {
  sendOnesignal,
  createNotification,
  createTitleAndContent,
  createMultiNotification,
  createNotificationWithTransaction,
  pushSocket,
  createNoti,
};
