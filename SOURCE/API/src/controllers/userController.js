/* eslint-disable operator-linebreak */
/* eslint-disable no-unreachable */
/* eslint-disable indent */
/* eslint-disable no-await-in-loop */
const { IS_ACTIVE, apiCode, config, ROLE, USER_HISTORY_TYPE, NOTI_TYPE, KEY_CHAT_ADMIN } = require('@utils/constant');
const {
  user,
  role,
  config: df_config,
  service,
  sale_info,
  provider_info,
  customer_info,
  province,
  order,
  message,
  message_option,
  user_invited,
  user_history,
  district,
  notification,
  provider_type,
  user_info,
  order_transaction,
  bank,
} = require('@models/');
const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');
const hat = require('hat');
const mediaController = require('@controllers/mediaController');
const notiController = require('@controllers/notiController');

const utils = require('@utils/utils');
const Joi = require('joi');
const sequelize = require('../config/env');

const { Op, QueryTypes } = Sequelize;
async function createUser(req, res) {
  const schema = Joi.object()
    .keys({
      full_name: Joi.string().required(),
      email: Joi.string().required(),
      password: Joi.string().required(),
      phone: Joi.string().required(),
      identify: Joi.string().empty(''),
      role_id: Joi.number().empty(0).required(),
    })
    .unknown(true);
  const { full_name, email, password, phone, identify, role_id } = await schema.validateAsync(req.body);

  const { province_id, address, gender, dob } = req.body;
  await checkCreateUser({ phone, email, role_id });
  const pass = await bcrypt.hashSync(password, config.CRYPT_SALT);
  const findUser = await sequelize.transaction(async (transaction) => {
    const token = hat();
    const key_chat = role_id == ROLE.ADMIN || role_id == ROLE.SALE_LEADER ? KEY_CHAT_ADMIN : hat();
    const userCreated = await user.create(
      { full_name, email, password: pass, user: phone, role_id, token, key_chat },
      { transaction }
    );
    await user_info.create(
      {
        user_id: userCreated.id,
        identify,
        ...(province_id && { province_id }),
        ...(address && { address }),
        ...(gender && { gender }),
        ...(dob && { dob }),
      },
      { transaction }
    );
    return userCreated;
  });
  return getUser(findUser.id, req);
}

async function update(req, res) {
  const schema = Joi.object()
    .keys({
      full_name: Joi.string().required(),
      email: Joi.string().required(),
      id: Joi.number().required(),
      identify: Joi.string().empty(''),
    })
    .unknown(true);
  const { full_name, email, id, identify } = await schema.validateAsync(req.body);

  const { province_id, address, gender, dob } = req.body;
  await checkCreateUser({ email, id });
  await sequelize.transaction(async (transaction) => {
    await user.update({ full_name, email }, { where: { id }, transaction });
    await user_info.update(
      {
        identify,
        ...(province_id && { province_id }),
        ...(address && { address }),
        ...(gender && { gender }),
        ...(dob && { dob }),
      },
      { where: { user_id: id }, transaction }
    );
  });
  return getUser(id, req);
}

async function login(req, res) {
  const { password, phone, device_id } = req.body;
  const token = hat();
  const updateUser = { token, ...(device_id && { device_id }) };

  const findUser = await user.findOne({ where: { user: phone, is_active: IS_ACTIVE.ACTIVE } });
  if (!findUser) {
    throw apiCode.LOGIN_FAIL;
  }
  const comparePassword = await bcrypt.compare(password, findUser.password);
  const compareResetPassword = findUser.reset_password
    ? await bcrypt.compare(password, findUser.reset_password)
    : false;
  if (compareResetPassword && findUser.expired_at >= Date.now()) {
    updateUser.password = bcrypt.hashSync(password, config.CRYPT_SALT);
    updateUser.reset_password = null;
    updateUser.expired_at = null;
  } else if (!comparePassword) {
    throw apiCode.LOGIN_FAIL;
  }
  await findUser.update(updateUser);
  return getUser(findUser.id, req);
}

async function changePassword(req, res) {
  try {
    const { auth } = req;
    const { new_pass, old_pass } = req.body;
    const new_pass_md5 = bcrypt.hashSync(new_pass, config.CRYPT_SALT);
    const info = await user.findOne({ where: { id: auth.id } });
    const comparePassword = await bcrypt.compare(old_pass, info.password);
    if (!comparePassword) throw apiCode.FAIL_CHANGE_PASS;
    await user.update({ password: new_pass_md5 }, { where: { id: auth.id } });
    return true;
  } catch (error) {
    throw error.code ? error : apiCode.DB_ERROR;
  }
}

async function checkCreateUser({ phone, email, id, role_id }) {
  if (id) {
    const findUser = await user.findOne({ where: { id } });
    if (!findUser) {
      throw apiCode.NOT_FOUND;
    }
  }
  if (phone) {
    const findUserPhone = await user.findOne({
      where: {
        user: phone,
        is_active: IS_ACTIVE.ACTIVE,
        id: id ? { [Op.ne]: id } : { [Op.ne]: null },
      },
    });
    if (findUserPhone) {
      throw apiCode.ACCOUNT_EXIST;
    }
  }
  if (email) {
    const findUserEmail = await user.findOne({
      where: {
        email,
        is_active: IS_ACTIVE.ACTIVE,
        id: id ? { [Op.ne]: id } : { [Op.ne]: null },
      },
    });
    if (findUserEmail) {
      throw apiCode.EMAIL_EXIST;
    }
  }
  if (role_id) {
    const findRole = await role.findOne({ where: { id: role_id, is_show: 1 } });
    if (!findRole) {
      throw apiCode.NOT_FOUND;
    }
  }
}
async function getUserInfo(req, res) {
  const { auth } = req;
  return getUser(auth.id, req);
}
async function getUser(id, req) {
  const fullUrl = utils.getUrl(req);

  const findUser = await user.findOne({
    where: { id },
    attributes: [
      ['user', 'phone'],
      'device_id',
      'token',
      'email',
      'full_name',
      'role_id',
      'id',
      'key_chat',
      [sequelize.literal(`'${KEY_CHAT_ADMIN}'`), 'key_chat_admin'],
    ],
    include: [
      {
        model: role,
      },
      {
        model: sale_info,
        attributes: {
          include: [
            [
              sequelize.literal(
                `IF(LENGTH(sale_info.profile_image) > 0,
    CONCAT ('${fullUrl}', sale_info.profile_image),
    sale_info.profile_image)`
              ),
              'profile_image',
            ],
          ],
        },
      },
      {
        model: provider_info,
        include: [{ model: province }, { model: district }, { model: provider_type }],
        attributes: {
          include: [
            [
              sequelize.literal(
                `IF(LENGTH(provider_info.profile_image) > 0,
  CONCAT ('${fullUrl}', provider_info.profile_image),
  provider_info.profile_image)`
              ),
              'profile_image',
            ],
          ],
        },
      },
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
      {
        model: user_info,
        include: [{ model: province }],
        attributes: {
          include: [
            [
              sequelize.literal(
                `IF(LENGTH(user_info.profile_image) > 0,
  CONCAT ('${fullUrl}', user_info.profile_image),
  user_info.profile_image)`
              ),
              'profile_image',
            ],
          ],
        },
      },
    ],
  });
  if (findUser.role_id == ROLE.CUSTOMER) {
    const findCount = await user_invited.count({ where: { user_id: id } });
    findUser.dataValues.referred = findCount > 0;
  }
  if (findUser.role_id == ROLE.PROVIDER && findUser.provider_info.parent_id) {
    const findParent = await user.findOne({ where: { id: findUser.provider_info.parent_id } });
    const findService = await provider_info.findOne({ where: { provider_id: findParent.id } });
    findUser.dataValues.parent_name = findParent.full_name;
    findUser.dataValues.provider_name = findService.provider_name;
  }
  return findUser;
}
async function logout(req, res) {
  const { auth } = req;
  await user.update({ device_id: '', token: '' }, { where: { id: auth.id } });
  return '';
}

async function uploadAvatar(req, res) {
  const { auth } = req;
  const profile_image = await mediaController.uploadMediaWithName(req, 'image');
  if (auth.role_id == ROLE.CUSTOMER) {
    await customer_info.update({ ...(profile_image && { profile_image }) }, { where: { customer_id: auth.id } });
  }
  if (auth.role_id == ROLE.SALE) {
    await sale_info.update({ ...(profile_image && { profile_image }) }, { where: { sale_id: auth.id } });
  }
  if (auth.role_id == ROLE.PROVIDER) {
    await provider_info.update({ ...(profile_image && { profile_image }) }, { where: { provider_id: auth.id } });
  }
  return getUser(auth.id, req);
}

async function uploadImage(req, res) {
  const { id } = req.body;
  const findUser = await user.findOne({ where: { id } });
  if (!findUser) {
    throw apiCode.NOT_FOUND;
  }
  const { role_id } = findUser;
  const profile_image = await mediaController.uploadMediaWithName(req, 'image');
  if (role_id == ROLE.CUSTOMER) {
    await customer_info.update({ ...(profile_image && { profile_image }) }, { where: { customer_id: id } });
  }
  if (role_id == ROLE.SALE) {
    await sale_info.update({ ...(profile_image && { profile_image }) }, { where: { sale_id: id } });
  }
  if (role_id == ROLE.PROVIDER) {
    await provider_info.update({ ...(profile_image && { profile_image }) }, { where: { provider_info: id } });
  }
  return getUser(id, req);
}
async function getRole(req, res) {
  const { is_show = 1 } = req.query;
  return role.findAll({ where: { is_show } });
}
async function listUser(req, res) {
  const { search = '', role_id, page = 1, limit = config.PAGING_LIMIT, offset = 0 } = req.query;
  const { rows, count } = await user.findAndCountAll({
    where: {
      role_id: role_id || { [Op.ne]: null },
      [Op.or]: [{ full_name: { [Op.substring]: search } }, { user: { [Op.substring]: search } }],
    },
    attributes: ['id', 'full_name', ['user', 'phone'], 'email', 'created_at'],
    include: { model: role, where: { is_show: 1 } },
    limit,
    offset,
    order: [['id', 'DESC']],
  });
  return { data: rows, paging: { page, count, limit } };
}
async function userDetail(req, res) {
  const { id } = req.query;
  return getUser(id, req);
}

async function deleteUser(req, res) {
  const { auth } = req;
  const { listID } = req.body;
  if (listID.includes(auth.id)) {
    throw apiCode.DELETE_FAIL.withMessage('Bạn không thể xoá chính mình');
  }
  const listServiceProvider = await order
    .findAll({ where: { sale_leader_id: { [Op.in]: listID } } })
    .map((item) => item.sale_leader_id);
  if (listServiceProvider.length > 0) {
    const listProviderName = await user
      .findAll({ where: { id: { [Op.in]: listServiceProvider } } })
      .map((item) => item.full_name);
    let input = '';
    for (let i = 0; i < listProviderName.length; i++) {
      input += `${listProviderName[i]}${i < listProviderName.length - 1 ? ', ' : ''}`;
    }
    if (input.length > 0) {
      throw apiCode.DELETE_FAIL.withMessage(`Tài khoản sale_leader: ${input} không thể xoá`);
    }
  }
  await sequelize.transaction(async (transaction) => {
    await user_info.destroy({ where: { user_id: { [Op.in]: listID } }, transaction });
    await user.destroy({ where: { id: { [Op.in]: listID } }, transaction });
  });
  return true;
}

async function getlistNoti(req, res) {
  const { auth } = req;
  const { page = 1, limit = config.PAGING_LIMIT, offset = 0 } = req.query;
  const user_id = auth.role_id !== ROLE.ADMIN ? auth.id : null;
  const { rows, count } = await notification.findAndCountAll({
    where: { user_id },
    order: [['id', 'desc']],
    limit,
    offset,
  });
  const countUnread = await notification.count({
    where: { user_id, is_read: 0 },
    order: [['id', 'desc']],
    limit,
    offset,
  });
  return { data: rows, countUnread, paging: { page, count, limit } };
}

async function updateIsRead(req, res) {
  const { id } = req.body;
  await notification.update({ is_read: 1 }, { where: { id } });
  return true;
}

async function getPointHistory(req, res) {
  const { auth } = req;
  if (auth.role_id == ROLE.CUSTOMER) {
    req.query.customer_id = auth.id;
  }
  const { type, search = '', page = 1, limit = config.PAGING_LIMIT, offset = 0, customer_id } = req.query;
  const whereUser =
    auth.role_id != ROLE.CUSTOMER || auth.role_id != ROLE.SALE
      ? {
        role_id: ROLE.CUSTOMER,
        [Op.or]: [{ full_name: { [Op.substring]: search } }, { user: { [Op.substring]: search } }],
      }
      : {};
  const { rows, count } = await user_history.findAndCountAll({
    where: {
      user_id: customer_id || { [Op.ne]: null },
      type: type || { [Op.ne]: null },
    },
    include: { model: user, attributes: [['user', 'phone'], 'full_name'], where: whereUser },
    order: [['id', 'desc']],
    limit,
    offset,
  });
  return { data: rows, paging: { page, count, limit } };
}

async function getConfig(req, res) {
  return df_config.findAll();
}
async function updateConfig(req, res) {
  const listUpdate = req.body;
  for (let i = 0; i < listUpdate.length; i++) {
    await df_config.update({ value: listUpdate[i].value }, { where: { id: listUpdate[i].id } });
  }
  return getConfig(req, res);
}
async function referred(req, res) {
  const { auth } = req;
  const { ref_by_phone } = req.body;
  const findUser = await user.findOne({
    where: { user: ref_by_phone, is_active: IS_ACTIVE.ACTIVE, role_id: ROLE.CUSTOMER, id: { [Op.ne]: auth.id } },
  });
  const listConfig = await df_config.findAll();
  const { value } = listConfig[2];
  if (!findUser) {
    throw apiCode.UPDATE_FAIL.withMessage('Mã giới thiệu không đúng');
  }
  const findList = await user_invited.count({ where: { user_id: auth.id } });
  if (findList > 0) {
    throw apiCode.UPDATE_FAIL.withMessage('Mã giới thiệu chỉ được nhập 1 lần');
  }
  const findUserInvited = await user_invited
    .findAll({ where: { user_id: findUser.id } })
    .map((u) => ({ user_id: auth.id, invited_by: u.invited_by, reward: u.reward / 2 }));
  const listCreate = [{ user_id: auth.id, invited_by: findUser.id, reward: value }, ...findUserInvited];
  const listCustomerId = listCreate.map((u) => u.invited_by);
  const listCustomer = await customer_info.findAll({ where: { customer_id: { [Op.in]: listCustomerId } } });
  const findCustomerinfo = await customer_info.findOne({ where: { customer_id: auth.id } });
  const ListCreateHistory = [
    {
      user_id: findCustomerinfo.customer_id,
      point: listConfig[1].value,
      balance: findCustomerinfo.point + listConfig[1].value,
      type: USER_HISTORY_TYPE.INVITE,
      content: `Bạn được cộng ${listConfig[1].value} khi giới thiệu app`,
    },
  ];
  await sequelize.transaction(async (transaction) => {
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
  });
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
  return listCreate;
}
async function getStatistic(req, res) {
  const query = `SELECT
  (SELECT COUNT(u.id) FROM user AS u WHERE u.role_id = ${ROLE.CUSTOMER}) as total_customer,
  (SELECT CAST(SUM(price)  AS UNSIGNED) FROM \`order\` ) as total_price,
  (SELECT COUNT(o.id) FROM \`order\` as o JOIN service as s ON o.service_id = s.id 
  WHERE o.sale_id IS NULL AND s.service_category_id !=1 ) as not_assigned,
  (SELECT COUNT(o.id) FROM \`order\` as o JOIN service as s ON o.service_id = s.id 
  WHERE o.sale_id IS NULL AND s.service_category_id =1 ) as not_assigned_tour,
  (SELECT COUNT(id) FROM \`order\` WHERE status != 10) as not_finish,
  (SELECT COUNT(id) FROM \`order\` WHERE status = 10) as finished,
  (SELECT COUNT(id) FROM \`order\`) as total_order
  `;
  const data = await sequelize.query(query, { type: QueryTypes.SELECT });
  return data[0];
}

async function getListMessageOption(req, res) {
  return message_option.findAll();
}

async function getListMessage(req, res) {
  const { page = 1, limit = config.PAGING_LIMIT, offset = 0 } = req.query;
  const { rows, count } = await message.findAndCountAll({ limit, offset });
  return { data: rows, paging: { page, count, limit } };
}
async function createOrUpdateMessage(req, res) {
  const { id, content } = req.body;
  if (id) {
    await message.update({ content }, { where: { id } });
  } else {
    await message.create({ content });
  }
}
async function deleteMessage(req, res) {
  const { id } = req.body;
  await message.destroy({ where: { id } });
  return message.findAll();
}

async function testNoti(req, res) {
  const { user_id, metaData, type, context } = req.body;
  return notiController.createNotification({ user_id, metaData, type, context });
}

async function createBank(req, res) {
  const { name, seri_number, account } = req.body;
  const findBank = await bank.findOne({ where: { name, seri_number, account } });
  if (findBank) {
    throw apiCode.ACCOUNT_EXIST.withMessage('Dữ liệu đã tồn tại');
  }
  const bankCreate = await bank.create({ name, seri_number, account });
  return bankCreate;
}

async function updateBank(req, res) {
  const { id, name, seri_number, account } = req.body;
  const findBank = await bank.findOne({ where: { id } });
  if (!findBank) {
    throw apiCode.NOT_FOUND;
  }
  const findAllBank = await bank.findOne({ where: { name, seri_number, account, id: { [Op.ne]: id } } });
  if (findAllBank) {
    throw apiCode.ACCOUNT_EXIST.withMessage('Dữ liệu đã tồn tại');
  }
  await bank.update({ name, seri_number, account }, { where: { id } });
  return bank.findOne({ where: { id } });
}

async function getBanks(req, res) {
  const { search = '' } = req.query;
  const findBanks = await bank.findAll({ where: { name: { [Op.substring]: search } } });
  return findBanks;
}

async function deleteBanks(req, res) {
  const { listID = [] } = req.query;
  if (listID && listID.length > 0) {
    await order_transaction.update({ bank_id: null }, { where: { bank_id: { [Op.in]: listID } } });
    await bank.destroy({ where: { id: { [Op.in]: listID } } });
  }
  return true;
}
module.exports = {
  createUser,
  login,
  getUserInfo,
  getUser,
  logout,
  checkCreateUser,
  uploadAvatar,
  uploadImage,
  getRole,
  listUser,
  userDetail,
  update,
  deleteUser,
  getlistNoti,
  getPointHistory,
  getConfig,
  updateConfig,
  referred,
  getStatistic,
  getListMessageOption,
  getListMessage,
  createOrUpdateMessage,
  deleteMessage,
  testNoti,
  createBank,
  updateBank,
  getBanks,
  deleteBanks,
  changePassword,
  updateIsRead,
};
