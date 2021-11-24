/* eslint-disable no-await-in-loop */
const { config, ROLE, IS_ACTIVE, apiCode, USER_HISTORY_TYPE, NOTI_TYPE } = require('@utils/constant');
const { user, customer_info, order, user_invited, df_config, user_history } = require('@models/');
const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const userController = require('@controllers/userController');
const orderController = require('@controllers/orderController');
const notiController = require('@controllers/notiController');

const hat = require('hat');
const utils = require('@utils/utils');
const sequelize = require('../config/env');

const { Op, col } = Sequelize;

async function register(req, res) {
  console.log('register', req.body);
  const schema = Joi.object()
    .keys({
      full_name: Joi.string().required(),
      email: Joi.string().required(),
      password: Joi.string().required(),
      phone: Joi.string().required(),
      address: Joi.string().empty(''),
    })
    .unknown(true);
  const { full_name, email, password, phone, address, device_id } = await schema.validateAsync(req.body);
  const role_id = ROLE.CUSTOMER;
  const pass = await bcrypt.hashSync(password, config.CRYPT_SALT);
  await userController.checkCreateUser({ phone, email });
  const findUser = await sequelize.transaction(async (transaction) => {
    const token = hat();
    const key_chat = hat();
    const createCustomer = await user.create(
      { full_name, email, password: pass, user: phone, role_id, device_id, token, key_chat },
      { transaction }
    );
    await customer_info.create(
      { customer_id: createCustomer.id, profile_image: '', address, point: 0 },
      { transaction }
    );
    return createCustomer;
  });
  return userController.getUser(findUser.id, req);
}
async function update(req, res) {
  const schema = Joi.object()
    .keys({
      full_name: Joi.string().required(),
      email: Joi.string().required(),
      address: Joi.string().empty(''),
      dob: Joi.string().empty(''),
      gender: Joi.number().empty(null),
    })
    .unknown(true);
  const { full_name, email, dob, address, gender, ref_by_phone } = await schema.validateAsync(req.body);
  const { auth } = req;
  const customer_id = auth.id;
  await userController.checkCreateUser({ email, id: customer_id });
  await sequelize.transaction(async (transaction) => {
    const createCustomer = await user.update({ full_name, email }, { where: { id: customer_id }, transaction });
    await customer_info.update(
      {
        ...(dob && { dob }),
        ...(address && { address }),
        ...(gender && { gender }),
      },
      { where: { customer_id }, transaction }
    );
    await refer(ref_by_phone, createCustomer.id, transaction);
    return createCustomer;
  });
  return userController.getUser(auth.id, req);
}
async function refer(ref_by_phone, id, transaction) {
  const listConfig = await df_config.findAll();
  const { value } = listConfig[2];
  const findUser = await user.findOne({
    where: { user: ref_by_phone, is_active: IS_ACTIVE.ACTIVE, role_id: ROLE.CUSTOMER, id: { [Op.ne]: id } },
  });
  if (!findUser) {
    throw apiCode.UPDATE_FAIL.withMessage('Mã giới thiệu không đúng');
  }
  const findList = await user_invited.count({ where: { user_id: id } });
  if (findList > 0) {
    throw apiCode.UPDATE_FAIL.withMessage('Mã giới thiệu chỉ được nhập 1 lần');
  }
  const findUserInvited = await user_invited
    .findAll({ where: { user_id: findUser.id } })
    .map((u) => ({ user_id: id, invited_by: u.invited_by, reward: u.reward / 2 }));
  const listCreate = [{ user_id: id, invited_by: findUser.id, reward: value }, ...findUserInvited];
  const listCustomerId = listCreate.map((u) => u.invited_by);
  const listCustomer = await customer_info.findAll({ where: { customer_id: { [Op.in]: listCustomerId } } });
  const findCustomerinfo = await customer_info.findOne({ where: { customer_id: id } });
  const ListCreateHistory = [
    {
      user_id: findCustomerinfo.customer_id,
      point: listConfig[1].value,
      balance: findCustomerinfo.point + listConfig[1].value,
      type: USER_HISTORY_TYPE.INVITE,
      content: `Bạn được cộng ${listConfig[1].value} khi giới thiệu app`,
    },
  ];
  for (let index = 0; index < listCreate.length; index++) {
    const findCustomer = listCustomer.find((u) => u.customer_id == listCreate[index].invited_by);
    const point = (listCreate[index].reward * listConfig[0].value * 2) / 100;
    console.log(point, findCustomer.customer_id);
    await customer_info.update(
      {
        point: findCustomer.point + point,
      },
      { where: { customer_id: findCustomer.customer_id }, transaction }
    );
    ListCreateHistory.push({
      user_id: listCreate[index].invited_by,
      point,
      balance: findCustomer.point + point,
      type: USER_HISTORY_TYPE.INVITE,
      content: `Bạn được cộng ${point} khi giới thiệu app`,
    });
  }

  await customer_info.update(
    {
      point: findCustomerinfo.point + listConfig[1].value,
    },
    { where: { customer_id: findCustomerinfo.customer_id }, transaction }
  );
  await user_history.bulkCreate(ListCreateHistory, { transaction });
  await user_invited.bulkCreate(listCreate, { transaction });
  console.log(ListCreateHistory);
  try {
    for (let index = 0; index < ListCreateHistory.length; index++) {
      await notiController.createNotification({
        user_id: ListCreateHistory[index].user_id,
        metaData: { user_id: ListCreateHistory[index].user_id },
        type: NOTI_TYPE.USER_HISTORY,
        context: ListCreateHistory[index].content,
      });
    }
  } catch (err) {
    console.error(err);
  }
}
async function getListCustomer(req, res) {
  const { search = '', is_active, page = 1, limit = config.PAGING_LIMIT, offset = 0 } = req.query;
  const { rows, count } = await user.findAndCountAll({
    where: {
      [Op.or]: [{ full_name: { [Op.substring]: search } }, { user: { [Op.substring]: search } }],
      is_active: is_active || { [Op.ne]: IS_ACTIVE.INACTIVE },
      role_id: ROLE.CUSTOMER,
    },
    attributes: [
      'id',
      'full_name',
      ['user', 'phone'],
      'email',
      [col('customer_info.dob'), 'dob'],
      [col('customer_info.address'), 'address'],
      'is_active',
    ],
    include: { model: customer_info, attributes: [] },
    limit,
    offset,
    order: ['full_name'],
  });
  return { data: rows, paging: { page, count, limit } };
}
async function getdetail(req, res) {
  const { id } = req.query;
  await userController.checkCreateUser({ id });
  return detail(id, req);
}
async function detail(id, req) {
  const fullUrl = utils.getUrl(req);
  const info = user.findOne({
    where: { id },
    attributes: [
      'id',
      'full_name',
      'email',
      ['user', 'phone'],
      'created_at',
      'is_active',
      [
        sequelize.literal(
          `(SELECT 
            CAST(IF(SUM(order.price) > 0,SUM(order.price),0) AS UNSIGNED) 
            FROM \`order\` 
            where customer_id = user.id)`
        ),
        'revenue',
      ],
    ],
    include: [
      {
        model: customer_info,
        attributes: {
          include: [
            [
              sequelize.literal(
                `IF(LENGTH(customer_info.profile_image) > 0,
  CONCAT ('${fullUrl}', customer_info.profile_image),
  customer_info.profile_image)`
              ),
              'profile_image',
            ],
          ],
        },
      },
    ],
  });
  return info;
}
async function updateIsActive(req, res) {
  const { id, is_active } = req.body;
  await userController.checkCreateUser({ id });
  await user.update({ is_active }, { where: { id } });
  return detail(id, req);
}
async function getListOrder(req, res) {
  const { auth } = req;
  if (auth.role_id == ROLE.CUSTOMER) {
    req.query.customer_id = auth.id;
  }
  const { customer_id, status, page = 1, limit = config.PAGING_LIMIT, offset = 0 } = req.query;
  return orderController.list({ customer_id, status, limit, offset, page, req });
}

async function deleteCustomer(req, res) {
  const { listID } = req.body;
  const listOrderProvider = await order
    .findAll({ where: { customer_id: { [Op.in]: listID } } })
    .map((item) => item.customer_id);
  if (listOrderProvider.length > 0) {
    const listProviderName = await user
      .findAll({ where: { id: { [Op.in]: listOrderProvider } } })
      .map((item) => item.full_name);
    let input = '';
    for (let i = 0; i < listProviderName.length; i++) {
      input += `${listProviderName[i]}${i < listProviderName.length - 1 ? ', ' : ''}`;
    }
    if (input.length > 0) {
      throw apiCode.DELETE_FAIL.withMessage(`Khách hàng ${input} đã có đơn hàng không thể xoá`);
    }
  }
  await sequelize.transaction(async (transaction) => {
    await customer_info.destroy({ where: { customer_id: { [Op.in]: listID } }, transaction });
    await user.destroy({ where: { id: { [Op.in]: listID } }, transaction });
  });
  return true;
}

async function getCustomerPoint(req, res) {
  const { customer_id } = req.query;
  const customers = await customer_info.findOne({ where: { customer_id } });
  if (!customers) {
    throw apiCode.NOT_FOUND;
  }
  return customers.point;
}
module.exports = {
  register,
  update,
  getListCustomer,
  getdetail,
  updateIsActive,
  getListOrder,
  deleteCustomer,
  getCustomerPoint,
};
