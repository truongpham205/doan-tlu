/* eslint-disable no-param-reassign */
/* eslint-disable operator-linebreak */
/* eslint-disable max-len */
/* eslint-disable default-case */
const { USER_HISTORY_TYPE } = require('@utils/constant');
const { customer_info, sale_info, user_history } = require('@models');
const Sequelize = require('sequelize');
const notiController = require('@controllers/notiController');

const { Op } = Sequelize;

const sequelize = require('../config/env');

async function createContent({ type, point, context }) {
  let content = '';
  switch (type) {
    case USER_HISTORY_TYPE.PROFIT:
      content = `Bạn được công ${point} khi hoàn thành đơn hàng ${context}`;
      break;
    case USER_HISTORY_TYPE.USE_POINT:
      content = `Bạn bị trừ ${-point} để thanh toán cho đơn hàng ${context}`;
      break;
    case USER_HISTORY_TYPE.ROLL_BACK:
      content = `Bạn được công ${point} do đơn hàng ${context} đã bị hủy`;
      break;
    case USER_HISTORY_TYPE.INVITE:
      content = `Bạn được công ${point} khi giới thiệu app`;
      break;
  }
  return content;
}
async function createHistory({ customer_id, point, type, sale_id, findOrder, transaction }) {
  console.log({ customer_id, point, type, sale_id });
  let balance = 0;
  let user_id = 0;
  if (point != 0) {
    const context = findOrder ? findOrder.code : '';
    const content = await createContent({ type, point, context });
    if (customer_id) {
      const fincCustomer = await customer_info.findOne({ where: { customer_id } });
      balance = fincCustomer.point + point;
      user_id = customer_id;
      fincCustomer.update({ point: balance }, { transaction });
    } else {
      const fincCustomer = await sale_info.findOne({ where: { sale_id } });
      balance = fincCustomer.point + point;
      user_id = sale_id;
      fincCustomer.update({ point: balance }, { transaction });
    }
    const dataInput = { user_id, point, balance, type, content };
    await user_history.create(dataInput, { transaction });
    await notiController.createNotificationWithTransaction(
      { user_id, metadata: { type: 2 }, type: 2, context: content },
      { transaction }
    );
  }
}

module.exports = {
  createHistory,
};
