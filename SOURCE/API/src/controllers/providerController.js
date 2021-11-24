/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
/* eslint-disable no-loop-func */
/* eslint-disable no-await-in-loop */
/* eslint-disable indent */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-return-assign */
const { config, ROLE, apiCode, IS_ACTIVE, ORDER_STATUS } = require('@utils/constant');
const {
  user,
  provider_info,
  provider_type,
  province,
  service_category,
  district,
  order_surcharge,
  order_history,
  order_provider,
  salary_provider_order,
  salary_provider,
  service,
  order,
  order_transaction,
} = require('@models/');
const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const userController = require('@controllers/userController');
const mediaController = require('@controllers/mediaController');
const orderController = require('@controllers/orderController');
const utils = require('@utils/utils');
const hat = require('hat');
const sequelize = require('../config/env');

const { Op, col, QueryTypes } = Sequelize;

async function create(req, res) {
  console.log('register', req.body);
  const schema = Joi.object()
    .keys({
      full_name: Joi.string().required(),
      email: Joi.string().required(),
      password: Joi.string().required(),
      phone: Joi.string().required(),
      address: Joi.string().empty(''),
      account: Joi.string().empty(''),
      bank: Joi.string().empty(''),
      owner: Joi.string().empty(''),
      province_id: Joi.number().empty(null),
      district_id: Joi.number().empty(null),
      provider_name: Joi.string().empty('').required(),
      provider_type_id: Joi.number().required(),
    })
    .unknown(true);
  const {
    full_name,
    email,
    password,
    phone,
    address,
    account,
    bank,
    owner,
    province_id,
    district_id,
    provider_name,
    provider_type_id,
  } = await schema.validateAsync(req.body);
  const { auth } = req;
  let provider_id = null;
  if (auth.role_id == ROLE.PROVIDER) {
    const findProviderInfor = await provider_info.findOne({
      where: { provider_id: auth.id, parent_id: { [Op.ne]: null } },
    });
    provider_id = findProviderInfor ? findProviderInfor.parent_id : auth.id;
  }
  const role_id = ROLE.PROVIDER;
  const profile_image = await mediaController.uploadMediaWithName(req, 'image');
  const pass = await bcrypt.hashSync(password, config.CRYPT_SALT);
  await userController.checkCreateUser({ phone, email });
  await checkProvider({ provider_type_id });
  const findUser = await sequelize.transaction(async (transaction) => {
    const token = hat();
    const key_chat = hat();
    const createProvider = await user.create(
      {
        full_name,
        email,
        password: pass,
        user: phone,
        role_id,
        account,
        bank,
        owner,
        province_id,
        district_id,
        provider_name,
        provider_type_id,
        token,
        key_chat,
      },
      { transaction }
    );
    await provider_info.create(
      {
        provider_id: createProvider.id,
        ...(profile_image && { profile_image }),
        address,
        point: 0,
        account,
        bank,
        owner,
        province_id,
        district_id,
        provider_name,
        provider_type_id,
        ...(provider_id && { parent_id: provider_id }),
      },
      { transaction }
    );
    return createProvider;
  });
  return userController.getUser(findUser.id, req);
}
async function update(req, res) {
  const schema = Joi.object()
    .keys({
      full_name: Joi.string().required(),
      email: Joi.string().required(),
      address: Joi.string().empty(''),
      account: Joi.string().empty(''),
      bank: Joi.string().empty(''),
      owner: Joi.string().empty(''),
      province_id: Joi.number().empty(null),
      district_id: Joi.number().empty(null),
      provider_name: Joi.string().empty('').required(),
      provider_type_id: Joi.number().required(),
      provider_id: Joi.number().required(),
    })
    .unknown(true);
  const {
    full_name,
    email,
    address,
    account,
    bank,
    owner,
    province_id,
    district_id,
    provider_name,
    provider_type_id,
    provider_id,
  } = await schema.validateAsync(req.body);
  await checkProvider({ provider_type_id, provider_id });
  const profile_image = await mediaController.uploadMediaWithName(req, 'image');
  await userController.checkCreateUser({ email, id: provider_id });
  await sequelize.transaction(async (transaction) => {
    const createCustomer = await user.update({ full_name, email }, { where: { id: provider_id }, transaction });
    await provider_info.update(
      {
        ...(account && { account }),
        ...(address && { address }),
        ...(bank && { bank }),
        ...(owner && { owner }),
        ...(province_id && { province_id }),
        ...(district_id && { district_id }),
        ...(provider_name && { provider_name }),
        ...(provider_type_id && { provider_type_id }),
        ...(profile_image && { profile_image }),
      },
      { where: { provider_id }, transaction }
    );
    return createCustomer;
  });
  return userController.getUser(provider_id, req);
}

async function getListProvider(req, res) {
  const {
    search = '',
    province_id,
    district_id,
    provider_type_id,
    is_active,
    page = 1,
    limit = config.PAGING_LIMIT,
    offset = 0,
  } = req.query;
  const whereInfo = {
    ...(province_id && { province_id }),
    ...(district_id && { district_id }),
    ...(provider_type_id && { provider_type_id }),
    parent_id: null,
  };
  console.log(whereInfo);
  const { rows, count } = await user.findAndCountAll({
    attributes: [
      'id',
      ['user', 'phone'],
      'is_active',
      'email',
      [col('provider_info.provider_name'), 'provider_name'],
      [col('provider_info.bank'), 'bank'],
      [col('provider_info.account'), 'account'],
      [col('provider_info.owner'), 'owner'],
      [col('provider_info.provider_type.name'), 'provider_type_name'],
    ],
    where: {
      is_active: is_active || { [Op.ne]: IS_ACTIVE.INACTIVE },
      role_id: ROLE.PROVIDER,
      search: sequelize.literal(
        `(user.user LIKE '%${search}%' 
        OR user.email LIKE '%${search}%' 
        OR provider_info.provider_name LIKE '%${search}%')`
      ),
    },
    include: {
      model: provider_info,
      where: whereInfo,
      attributes: [],
      include: { model: provider_type, attributes: [] },
    },
    subQuery: false,
    limit,
    offset,
    order: [['id', 'DESC']],
  });
  return { data: rows, paging: { page, count, limit } };
}
async function checkProvider({ provider_id, provider_type_id }) {
  if (provider_type_id) {
    const find_provider_type = await provider_type.findOne({ where: { id: provider_type_id } });
    if (!find_provider_type) {
      throw apiCode.NOT_FOUND.withMessage('Không tìm thấy loại nhà cung cấp');
    }
  }
  if (provider_id) {
    const find_provider = await user.findOne({
      where: { id: provider_id, is_active: { [Op.ne]: IS_ACTIVE.INACTIVE } },
    });
    if (!find_provider) {
      throw apiCode.NOT_FOUND.withMessage('Không tìm thấy nhà cung cấp');
    }
  }
}
async function createOrUpdateProviderType(req, res) {
  const schema = Joi.object()
    .keys({
      name: Joi.string().required(),
      id: Joi.number().empty(null),
      is_active: Joi.number().empty(1),
    })
    .unknown(true);
  const { name, id, is_active } = await schema.validateAsync(req.body);
  if (id) {
    const findType = await provider_type.findOne({ where: { id } });
    if (findType.is_update) {
      throw apiCode.UPDATE_FAIL.withMessage('Bạn không thể sửa loại nhà cung cấp này');
    }
    if (!findType) {
      throw apiCode.NOT_FOUND;
    }
    await findType.update({ name, is_active });
    return findType;
  }
  return provider_type.create({ name, is_active });
}
async function getListProviderType(req, res) {
  const { search = '', is_active, page = 1, limit = config.PAGING_LIMIT, offset = 0 } = req.query;
  const { rows, count } = await provider_type.findAndCountAll({
    where: { name: { [Op.substring]: search }, is_active: is_active || { [Op.ne]: IS_ACTIVE.INACTIVE } },
    limit,
    offset,
    order: [['id', 'DESC']],
  });
  return { data: rows, paging: { page, count, limit } };
}

async function getProviderDetail(req, res) {
  const fullUrl = utils.getUrl(req);
  const { id } = req.query;
  const info = user.findOne({
    where: { id },
    attributes: [
      'id',
      'full_name',
      'email',
      ['user', 'phone'],
      'created_at',
      [
        sequelize.literal(
          '(SELECT CAST(IF(SUM(order.price) > 0,SUM(order.price),0) AS UNSIGNED) FROM `order` where sale_id = user.id)'
        ),
        'revenue',
      ],
    ],
    include: [
      {
        model: provider_info,
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
        include: [{ model: provider_type }, { model: province }, { model: district }],
      },
    ],
  });
  return info;
}
async function getListOrder(req, res) {
  const { auth } = req;
  const { status, search = '', page = 1, limit = config.PAGING_LIMIT, offset = 0 } = req.query;
  let { provider_id } = req.query;
  if (auth.role_id == ROLE.PROVIDER) {
    const findProviderInfor = await provider_info.findOne({
      where: { provider_id: auth.id, parent_id: { [Op.ne]: null } },
    });
    provider_id = findProviderInfor ? findProviderInfor.parent_id : auth.id;
  }
  return orderController.list({ provider_id, status, limit, offset, page, req, search });
}

async function providerStatistic(req, res) {
  const {
    search = '',
    provider_type_id,
    page = 1,
    limit = config.PAGING_LIMIT,
    offset = 0,
    status = 1,
    fromDate,
  } = req.query;
  let { toDate } = req.query;
  if (toDate) {
    toDate = new Date(Date.parse(toDate) + 86400000).toISOString();
  }
  const findUser = await user.findAll({
    where: { role_id: ROLE.PROVIDER, full_name: { [Op.substring]: search } },
    attributes: [
      'id',
      'full_name',
      [col('provider_info.provider_type.name'), 'provider_type_name'],
      [
        sequelize.literal(`(SELECT count(od.id) FROM order_provider as od
        JOIN \`order\` as o ON od.order_id = o.id
        WHERE od.provider_id = user.id
         ${status
            ? status == 1
              ? `AND o.status = ${ORDER_STATUS.FINISHED}`
              : `AND o.status != ${ORDER_STATUS.FINISHED}`
            : ''
          }
         ${fromDate ? `AND o.created_at >= '${fromDate}'` : ''}
         ${toDate ? `AND o.created_at >= '${toDate}'` : ''}
        )`),
        'countOrder',
      ],
      [
        sequelize.literal(`(SELECT CAST( SUM(od.price) AS UNSIGNED) FROM order_transaction as od
        JOIN \`order\` as o ON od.order_id = o.id
        JOIN service as s ON s.id = o.service_id
        WHERE s.provider_id = user.id
        AND od.df_order_transaction_type_id = 3
        ${status
            ? status == 1
              ? `AND o.status = ${ORDER_STATUS.FINISHED}`
              : `AND o.status != ${ORDER_STATUS.FINISHED}`
            : ''
          }
        ${fromDate ? `AND o.created_at >= '${fromDate}'` : ''}
        ${toDate ? `AND o.created_at >= '${toDate}'` : ''}
        )`),
        'totalPrice3',
      ],
      [
        sequelize.literal(`(SELECT CAST( SUM(od.amount) AS UNSIGNED) FROM order_transaction as od
        JOIN \`order\` as o ON od.order_id = o.id
        JOIN service as s ON s.id = o.service_id
        WHERE s.provider_id = user.id
        AND od.df_order_transaction_type_id = 3
        ${status
            ? status == 1
              ? `AND o.status = ${ORDER_STATUS.FINISHED}`
              : `AND o.status != ${ORDER_STATUS.FINISHED}`
            : ''
          }
        ${fromDate ? `AND o.created_at >= '${fromDate}'` : ''}
        ${toDate ? `AND o.created_at >= '${toDate}'` : ''}
        )`),
        'totalAmount3',
      ],
      [
        sequelize.literal(`(SELECT CAST( SUM(od.amount) AS UNSIGNED) FROM order_transaction as od
        JOIN \`order\` as o ON od.order_id = o.id
        JOIN service as s ON s.id = o.service_id
        WHERE s.provider_id = user.id
        AND od.df_order_transaction_type_id = 4
        ${status
            ? status == 1
              ? `AND o.status = ${ORDER_STATUS.FINISHED}`
              : `AND o.status != ${ORDER_STATUS.FINISHED}`
            : ''
          }
        ${fromDate ? `AND o.created_at >= '${fromDate}'` : ''}
        ${toDate ? `AND o.created_at >= '${toDate}'` : ''}
        )`),
        'totalAmount4',
      ],
      [
        sequelize.literal(`(SELECT CAST( SUM(od.amount) AS UNSIGNED) FROM order_transaction as od
        JOIN \`order\` as o ON od.order_id = o.id
        JOIN service as s ON s.id = o.service_id
        WHERE s.provider_id = user.id
        AND od.df_order_transaction_type_id = 5
        ${status
            ? status == 1
              ? `AND o.status = ${ORDER_STATUS.FINISHED}`
              : `AND o.status != ${ORDER_STATUS.FINISHED}`
            : ''
          }
        ${fromDate ? `AND o.created_at >= '${fromDate}'` : ''}
        ${toDate ? `AND o.created_at >= '${toDate}'` : ''}
        )`),
        'totalAmount5',
      ],
    ],
    include: {
      model: provider_info,
      required: true,
      where: { provider_type_id: provider_type_id || { [Op.ne]: null }, parent_id: null },
      attributes: [],
      include: {
        model: provider_type,
        attributes: [],
      },
    },
    subQuery: false,
  });

  let totalPrice3 = 0;
  let totalAmount3 = 0;
  let totalAmount4 = 0;
  findUser.map((item) => (totalPrice3 += item.dataValues.totalPrice3));
  findUser.map((item) => (totalAmount3 += item.dataValues.totalAmount3));
  findUser.map((item) => (totalAmount4 += item.dataValues.totalAmount4));
  return {
    totalPrice3,
    totalAmount3,
    totalAmount4,
    data: findUser.slice(offset, offset + limit),
    paging: { page, count: findUser.length, limit },
  };
}
async function providerDetailStatistic(req, res) {
  const {
    search = '',
    provider_type_id,
    page = 1,
    limit = config.PAGING_LIMIT,
    offset = 0,
    status = 1,
    provider_id,
    fromDate,
  } = req.query;
  let { toDate } = req.query;
  if (toDate) {
    toDate = new Date(Date.parse(toDate) + 86400000).toISOString();
  }
  const findUser = await user.findOne({
    where: { role_id: ROLE.PROVIDER, full_name: { [Op.substring]: search }, id: provider_id },
    attributes: [
      'id',
      'full_name',
      ['user', 'phone'],
      [col('provider_info.provider_type.name'), 'provider_type_name'],
      [
        sequelize.literal(`(SELECT COUNT(odss.id) FROM (SELECT od.id FROM \`order\` as o
        JOIN \`order_provider\` as od ON od.order_id = o.id
        JOIN service as s ON s.id = o.service_id
        JOIN service_category as sc ON sc.id = s.service_category_id
        WHERE od.provider_id = user.id
         ${status
            ? status == 1
              ? `AND o.status = ${ORDER_STATUS.FINISHED}`
              : `AND o.status != ${ORDER_STATUS.FINISHED}`
            : ''
          }
         ${fromDate ? `AND o.created_at >= '${fromDate}'` : ''}
         ${toDate ? `AND o.created_at >= '${toDate}'` : ''}
        GROUP BY o.id
        ) as odss)`),
        'countOrder',
      ],
      [
        sequelize.literal(`(SELECT CAST( SUM(od.price) AS UNSIGNED) FROM order_transaction as od
        JOIN \`order\` as o ON od.order_id = o.id
        JOIN service as s ON s.id = o.service_id
        WHERE s.provider_id = user.id
        AND od.df_order_transaction_type_id = 3
        ${status
            ? status == 1
              ? `AND o.status = ${ORDER_STATUS.FINISHED}`
              : `AND o.status != ${ORDER_STATUS.FINISHED}`
            : ''
          }
        ${fromDate ? `AND o.created_at >= '${fromDate}'` : ''}
        ${toDate ? `AND o.created_at >= '${toDate}'` : ''}
        )`),
        'totalPrice3',
      ],
      [
        sequelize.literal(`(SELECT CAST( SUM(od.amount) AS UNSIGNED) FROM order_transaction as od
        JOIN \`order\` as o ON od.order_id = o.id
        JOIN service as s ON s.id = o.service_id
        WHERE s.provider_id = user.id
        AND od.df_order_transaction_type_id = 3
        ${status
            ? status == 1
              ? `AND o.status = ${ORDER_STATUS.FINISHED}`
              : `AND o.status != ${ORDER_STATUS.FINISHED}`
            : ''
          }
        ${fromDate ? `AND o.created_at >= '${fromDate}'` : ''}
        ${toDate ? `AND o.created_at >= '${toDate}'` : ''}
        )`),
        'totalAmount3',
      ],
      [
        sequelize.literal(`(SELECT CAST( SUM(od.amount) AS UNSIGNED) FROM order_transaction as od
        JOIN \`order\` as o ON od.order_id = o.id
        JOIN service as s ON s.id = o.service_id
        WHERE s.provider_id = user.id
        AND od.df_order_transaction_type_id = 4
        ${status
            ? status == 1
              ? `AND o.status = ${ORDER_STATUS.FINISHED}`
              : `AND o.status != ${ORDER_STATUS.FINISHED}`
            : ''
          }
        ${fromDate ? `AND o.created_at >= '${fromDate}'` : ''}
        ${toDate ? `AND o.created_at >= '${toDate}'` : ''}
        )`),
        'totalAmount4',
      ],
      [
        sequelize.literal(`(SELECT CAST( SUM(od.amount) AS UNSIGNED) FROM order_transaction as od
        JOIN \`order\` as o ON od.order_id = o.id
        JOIN service as s ON s.id = o.service_id
        WHERE s.provider_id = user.id
        AND od.df_order_transaction_type_id = 5
        ${status
            ? status == 1
              ? `AND o.status = ${ORDER_STATUS.FINISHED}`
              : `AND o.status != ${ORDER_STATUS.FINISHED}`
            : ''
          }
        ${fromDate ? `AND o.created_at >= '${fromDate}'` : ''}
        ${toDate ? `AND o.created_at >= '${toDate}'` : ''}
        )`),
        'totalAmount5',
      ],
      [
        sequelize.literal(`(SELECT CAST( SUM(od.amount) AS UNSIGNED) FROM order_surcharge as od
        JOIN \`order\` as o ON od.order_id = o.id
        JOIN service as s ON s.id = o.service_id
        WHERE s.provider_id = user.id
        ${status
            ? status == 1
              ? `AND o.status = ${ORDER_STATUS.FINISHED}`
              : `AND o.status != ${ORDER_STATUS.FINISHED}`
            : ''
          }
        ${fromDate ? `AND o.created_at >= '${fromDate}'` : ''}
        ${toDate ? `AND o.created_at >= '${toDate}'` : ''}
        )`),
        'totalAmountSurcharge',
      ],
      [
        sequelize.literal(`(SELECT CAST( SUM(od.price) AS UNSIGNED) FROM order_surcharge as od
        JOIN \`order\` as o ON od.order_id = o.id
        JOIN service as s ON s.id = o.service_id
        WHERE s.provider_id = user.id
        ${status
            ? status == 1
              ? `AND o.status = ${ORDER_STATUS.FINISHED}`
              : `AND o.status != ${ORDER_STATUS.FINISHED}`
            : ''
          }
        ${fromDate ? `AND o.created_at >= '${fromDate}'` : ''}
        ${toDate ? `AND o.created_at >= '${toDate}'` : ''}
        )`),
        'totalPriceSurcharge',
      ],
    ],
    include: {
      model: provider_info,
      where: { provider_type_id: provider_type_id || { [Op.ne]: null }, parent_id: null },
      attributes: [],
      required: true,
      include: {
        model: provider_type,
        attributes: [],
      },
    },
    subQuery: false,
  });

  const rows = await order.findAll({
    attributes: [
      'code',
      'adult',
      'children',
      'payment_provider_at',
      'created_at',
      'checkin_at',
      'checkout_at',
      [col('service.name'), 'service_name'],
      [col('service.service_category.name'), 'service_category_name'],
      [col('service.code'), 'service_code'],
    ],
    include: [
      { model: service, attributes: [], include: { model: service_category, attributes: [] } },
      { model: order_provider, attributes: [], where: { provider_id } },
      { model: order_surcharge, required: false },
      {
        model: order_transaction,
        required: false,
        attributes: ['df_order_transaction_type_id', 'amount', 'price'],
        where: { df_order_transaction_type_id: { [Op.in]: [3, 4] } },
      },
    ],
    subQuery: false,
    where: {
      status: status == 1 ? ORDER_STATUS.FINISHED : { [Op.ne]: ORDER_STATUS.FINISHED },
      created_at: {
        [Op.and]: [
          fromDate ? { [Op.gte]: fromDate } : { [Op.ne]: null },
          toDate ? { [Op.lte]: toDate } : { [Op.ne]: null },
        ],
      },
    },
  });
  return {
    detail: findUser,
    data: rows.slice(offset, offset + limit),
    paging: { page, count: rows.length, limit },
  };
}
async function deleteProviderType(req, res) {
  const { listID } = req.body;
  const listServiceID = await provider_info
    .findAll({ where: { provider_type_id: { [Op.in]: listID } } })
    .map((item) => item.provider_type_id);
  const listProviderRequire = await provider_type
    .findAll({ where: { id: { [Op.in]: listID }, is_update: { [Op.ne]: null } } })
    .map((item) => item.name);
  let input = '';
  for (let i = 0; i < listProviderRequire.length; i++) {
    input += `${listProviderRequire[i]}${i < listProviderRequire.length - 1 ? ', ' : ''}`;
  }
  if (input.length > 0) {
    throw apiCode.DELETE_FAIL.withMessage(`Loại nhà cung cấp: (${input}) là cố định không thể xoá`);
  }
  if (listServiceID.length > 0) {
    const listServiceName = await provider_type
      .findAll({ where: { id: { [Op.in]: listServiceID } } })
      .map((item) => item.name);
    for (let i = 0; i < listServiceName.length; i++) {
      input += `${listServiceName[i]}${i < listServiceName.length - 1 ? ', ' : ''}`;
    }
    if (input.length > 0) {
      throw apiCode.DELETE_FAIL.withMessage(`Loại nhà cung cấp ${input} không thể xoá`);
    }
  }
  await sequelize.transaction(async (transaction) => {
    await provider_type.destroy({ where: { id: { [Op.in]: listID } }, transaction });
  });
  return true;
}

async function deleteProvider(req, res) {
  const { listID } = req.body;
  const listOrderProvider = await order_provider
    .findAll({ where: { provider_id: { [Op.in]: listID } } })
    .map((item) => item.provider_id);
  const listServiceProvider = await service
    .findAll({ where: { provider_id: { [Op.in]: listID } } })
    .map((item) => item.provider_id);
  if (listOrderProvider.length > 0) {
    const listProviderName = await user
      .findAll({ where: { id: { [Op.in]: listOrderProvider } } })
      .map((item) => item.full_name);
    let input = '';
    for (let i = 0; i < listProviderName.length; i++) {
      input += `${listProviderName[i]}${i < listProviderName.length - 1 ? ', ' : ''}`;
    }
    if (input.length > 0) {
      throw apiCode.DELETE_FAIL.withMessage(`Nhà cung cấp ${input} đã có đơn hàng không thể xoá`);
    }
  }
  if (listServiceProvider.length > 0) {
    const listProviderName = await user
      .findAll({ where: { id: { [Op.in]: listServiceProvider } } })
      .map((item) => item.full_name);
    let input = '';
    for (let i = 0; i < listProviderName.length; i++) {
      input += `${listProviderName[i]}${i < listProviderName.length - 1 ? ', ' : ''}`;
    }
    if (input.length > 0) {
      throw apiCode.DELETE_FAIL.withMessage(`Nhà cung cấp ${input} đã trong một phòng không thể xoá`);
    }
  }
  await sequelize.transaction(async (transaction) => {
    await provider_info.destroy({ where: { provider_id: { [Op.in]: listID } }, transaction });
    await user.destroy({ where: { id: { [Op.in]: listID } }, transaction });
  });
  return true;
}

async function updateProviderInfo(req, res) {
  const schema = Joi.object()
    .keys({
      full_name: Joi.string().required(),
      email: Joi.string().required(),
    })
    .unknown(true);
  const { full_name, email, gender } = await schema.validateAsync(req.body);
  const { auth } = req;
  await userController.checkCreateUser({ email, id: auth.id });
  await sequelize.transaction(async (transaction) => {
    await user.update({ full_name, email }, { where: { id: auth.id }, transaction });
    await provider_info.update(
      {
        ...(gender && { gender }),
      },
      { where: { sale_id: auth.id }, transaction }
    );
  });
  return userController.getUser(auth.id, req);
}

async function getSalariesOfSale(req, res) {
  const { auth } = req;
  const { page = 1, limit = config.PAGING_LIMIT, offset = 0 } = req.query;
  const { rows, count } = await order.findAndCountAll({
    attributes: [
      'id',
      'code',
      [col('service.name'), 'service_name'],
      [col('service.id'), 'service_id'],
      'adult',
      'children',
      'checkin_at',
      'checkout_at',
      'price',
      'profit',
    ],
    include: [
      { model: service, attributes: [] },
      { model: order_provider, where: { provider_id: auth.id }, required: true },
    ],
    subQuery: false,
    limit,
    offset,
  });
  return { data: rows, paging: { page, count, limit } };
}

async function getListManagers(req, res) {
  const { search = '', is_active, page = 1, limit = config.PAGING_LIMIT, offset = 0 } = req.query;
  const { auth } = req;
  const { rows, count } = await user.findAndCountAll({
    attributes: [
      'id',
      ['user', 'phone'],
      'is_active',
      'email',
      [col('provider_info.provider_name'), 'provider_name'],
      [col('provider_info.bank'), 'bank'],
      [col('provider_info.account'), 'account'],
      [col('provider_info.owner'), 'owner'],
      [col('provider_info.provider_type.name'), 'provider_type_name'],
    ],
    where: {
      is_active: is_active || { [Op.ne]: IS_ACTIVE.INACTIVE },
      role_id: ROLE.PROVIDER,
      search: sequelize.literal(
        `(user.user LIKE '%${search}%' 
        OR user.email LIKE '%${search}%' 
        OR provider_info.provider_name LIKE '%${search}%')`
      ),
    },
    include: {
      model: provider_info,
      where: { parent_id: auth.id },
      attributes: [],
      include: { model: provider_type, attributes: [] },
    },
    subQuery: false,
    limit,
    offset,
    order: [['id', 'DESC']],
  });
  return { data: rows, paging: { page, count, limit } };
}

async function updatePayment(req, res) {
  const { auth } = req;
  const { id } = req.body;
  const findSalary = await salary_provider.findOne({ where: { id } });
  if (!findSalary) {
    throw apiCode.INVALID_PARAM;
  }
  if (findSalary.is_payment == 1) {
    throw apiCode.UPDATE_FAIL.withMessage('Đã quyết toán cho sale này');
  }
  await findSalary.update({ is_payment: 1, payment_by: auth.id, payment_at: Date.now() });
  return 1;
}

async function deleteManager(req, res) {
  const { listID } = req.body;
  await sequelize.transaction(async (transaction) => {
    await order_history.update({ provider_id: null }, { where: { provider_id: { [Op.in]: listID } }, transaction });
    await provider_info.destroy({ where: { provider_id: { [Op.in]: listID } }, transaction });
    await user.destroy({ where: { id: { [Op.in]: listID } }, transaction });
  });
}
async function salaryOfProvider(req, res) {
  const { toDate } = req.body;
  if (!toDate) {
    throw apiCode.INVALID_PARAM.withMessage('vui lòng chọn ngày kết thúc');
  }
  const newToDate = new Date(Date.parse(toDate) + 86400000).toISOString();
  const listProvider = await getListSalaryCreate(newToDate);
  const listOrder = await order.findAll({
    where: {
      status: ORDER_STATUS.FINISHED,
      order_id: sequelize.where(col('salary_provider_orders.id'), null),
      payment_provider_at: null,
    },
    include: [
      {
        model: salary_provider_order,
        attributes: [],
        required: false,
      },
      {
        model: service,
        where: { provider_id: { [Op.ne]: null } },
        required: true,
      },
      {
        model: order_history,
        attributes: [],
        where: {
          status: ORDER_STATUS.FINISHED,
          created_at: { [Op.lte]: newToDate },
        },
      },
    ],
  });
  const listOrderID = listOrder.map((u) => u.id);
  await sequelize.transaction(async (transaction) => {
    for (let index = 0; index < listProvider.length; index++) {
      const salaryCreate = await salary_provider.create(
        {
          provider_id: listProvider[index].id,
          start_at: listProvider[index].dataValues.minDate,
          end_at: toDate,
          total_price:
            listProvider[index].dataValues.amount3
            - listProvider[index].dataValues.amount4
            - listProvider[index].dataValues.amount6
            - listProvider[index].dataValues.amount5
            + listProvider[index].dataValues.amount_surcharge,
        },
        { transaction }
      );
      const listSalaryOrder = listOrder
        .filter((item) => item.service.provider_id == listProvider[index].id)
        .map((u) => ({ order_id: u.id, salary_provider_id: salaryCreate.id }));
      await salary_provider_order.bulkCreate(listSalaryOrder, { transaction });
      order.update({ payment_provider_at: Date.now() }, { where: { id: { [Op.in]: listOrderID } }, transaction });
    }
  });
  return 1;
}
async function deleteSalary(req, res) {
  const { listID } = req.body;
  const countSalaryPayed = await salary_provider.count({ where: { id: { [Op.in]: listID }, is_payment: 1 } });
  if (countSalaryPayed > 0) {
    throw apiCode.UPDATE_FAIL.withMessage('Đã có nhà cung cấp đã quyết toán thành công không thể xóa');
  }
  const listOrderID = await salary_provider_order.findAll({ where: { salary_provider_id: { [Op.in]: listID } } }).map((u) => u.id);
  await sequelize.transaction(async (transaction) => {
    await salary_provider_order.destroy({ where: { salary_provider_id: { [Op.in]: listID } } }, { transaction });
    await salary_provider.destroy({ where: { id: { [Op.in]: listID } } }, { transaction });
    order.update({ payment_provider_at: null }, { where: { id: { [Op.in]: listOrderID } }, transaction });
  });
}
async function getListSalaryCreate(toDate) {
  const findUser = await user.findAll({
    where: { role_id: ROLE.PROVIDER },
    attributes: [
      'id',
      [col('provider_info.provider_name'), 'full_name'],
      ['user', 'provider_phone'],
      [
        sequelize.literal(`(SELECT count(o.id) FROM \`order\` as o
        LEFT JOIN salary_provider_order AS os ON os.order_id = o.id
        JOIN service as s ON s.id = o.service_id AND s.provider_id IS NOT NULL
        JOIN order_history AS oh ON o.id = oh.order_id AND oh.status = 10
        WHERE os.id IS NULL AND s.provider_id = user.id AND payment_provider_at IS NULL
         AND o.status = ${ORDER_STATUS.FINISHED}
         ${toDate ? `AND oh.created_at <= '${toDate}'` : ''}
        )`),
        'countOrder',
      ],
      [
        sequelize.literal(`(SELECT CAST( SUM(ot.amount) AS UNSIGNED) FROM order_transaction as ot
        JOIN \`order\` as o ON ot.order_id = o.id
        LEFT JOIN salary_provider_order AS os ON os.order_id = o.id
        JOIN service as s ON s.id = o.service_id AND s.provider_id IS NOT NULL
        JOIN order_history AS oh ON o.id = oh.order_id AND oh.status = 10
        WHERE os.id IS NULL AND s.provider_id = user.id AND ot.df_order_transaction_type_id = 3
         AND o.status = ${ORDER_STATUS.FINISHED}
         ${toDate ? `AND oh.created_at <= '${toDate}'` : ''}
        )`),
        'amount3',
      ],
      [
        sequelize.literal(`(SELECT CAST( SUM(ot.amount) AS UNSIGNED) FROM order_transaction as ot
        JOIN \`order\` as o ON ot.order_id = o.id
        LEFT JOIN salary_provider_order AS os ON os.order_id = o.id
        JOIN service as s ON s.id = o.service_id AND s.provider_id IS NOT NULL
        JOIN order_history AS oh ON o.id = oh.order_id AND oh.status = 10
        WHERE os.id IS NULL AND s.provider_id = user.id AND ot.df_order_transaction_type_id = 4
         AND o.status = ${ORDER_STATUS.FINISHED}
         ${toDate ? `AND oh.created_at <= '${toDate}'` : ''}
        )`),
        'amount4',
      ],
      [
        sequelize.literal(`(SELECT CAST( SUM(ot.amount) AS UNSIGNED) FROM order_transaction as ot
        JOIN \`order\` as o ON ot.order_id = o.id
        LEFT JOIN salary_provider_order AS os ON os.order_id = o.id
        JOIN service as s ON s.id = o.service_id AND s.provider_id IS NOT NULL
        JOIN order_history AS oh ON o.id = oh.order_id AND oh.status = 10
        WHERE os.id IS NULL AND s.provider_id = user.id AND ot.df_order_transaction_type_id = 6 and is_epay != 1
         AND o.status = ${ORDER_STATUS.FINISHED}
         ${toDate ? `AND oh.created_at <= '${toDate}'` : ''}
        )`),
        'amount6',
      ],
      [
        sequelize.literal(`(SELECT CAST( SUM(ot.amount) AS UNSIGNED) FROM order_transaction as ot
        JOIN \`order\` as o ON ot.order_id = o.id
        LEFT JOIN salary_provider_order AS os ON os.order_id = o.id
        JOIN service as s ON s.id = o.service_id AND s.provider_id IS NOT NULL
        JOIN order_history AS oh ON o.id = oh.order_id AND oh.status = 10
        WHERE os.id IS NULL AND s.provider_id = user.id AND ot.df_order_transaction_type_id = 5
         AND o.status = ${ORDER_STATUS.FINISHED}
         ${toDate ? `AND oh.created_at <= '${toDate}'` : ''}
        )`),
        'amount5',
      ],
      [
        sequelize.literal(`(SELECT CAST( SUM(ot.amount) AS UNSIGNED) FROM order_surcharge as ot
        JOIN \`order\` as o ON ot.order_id = o.id
        LEFT JOIN salary_provider_order AS os ON os.order_id = o.id
        JOIN service as s ON s.id = o.service_id AND s.provider_id IS NOT NULL
        JOIN order_history AS oh ON o.id = oh.order_id AND oh.status = 10
        WHERE os.id IS NULL AND s.provider_id = user.id
         AND o.status = ${ORDER_STATUS.FINISHED}
         ${toDate ? `AND oh.created_at <= '${toDate}'` : ''}
        )`),
        'amount_surcharge',
      ],
      [
        sequelize.literal(`(SELECT CAST( SUM(ot.price) AS UNSIGNED) FROM order_surcharge as ot
        JOIN \`order\` as o ON ot.order_id = o.id
        LEFT JOIN salary_provider_order AS os ON os.order_id = o.id
        JOIN service as s ON s.id = o.service_id AND s.provider_id IS NOT NULL
        JOIN order_history AS oh ON o.id = oh.order_id AND oh.status = 10
        WHERE os.id IS NULL AND s.provider_id = user.id
         AND o.status = ${ORDER_STATUS.FINISHED}
         ${toDate ? `AND oh.created_at <= '${toDate}'` : ''}
        )`),
        'price_surcharge',
      ],
      [
        sequelize.literal(`(SELECT MIN(oh.created_at) FROM \`order\` as o
        LEFT JOIN salary_provider_order AS os ON os.order_id = o.id
        JOIN service as s ON s.id = o.service_id AND s.provider_id IS NOT NULL
        JOIN order_history AS oh ON o.id = oh.order_id AND oh.status = 10
        WHERE os.id IS NULL AND s.provider_id = user.id
         AND o.status = ${ORDER_STATUS.FINISHED}
         ${toDate ? `AND oh.created_at <= '${toDate}'` : ''}
        )`),
        'minDate',
      ],
      [sequelize.literal(`'${toDate}'`), 'maxDate'],
    ],
    include: { model: provider_info, where: { parent_id: null }, attributes: [] },
    subQuery: false,
  });
  return findUser.filter((item) => item.dataValues.countOrder > 0);
}
async function getsalaryDetail(req, res) {
  const { id, page = 1, limit = config.PAGING_LIMIT, offset = 0 } = req.query;
  const findSalary = await salary_provider.findOne({
    where: { id },
    include: [
      { model: user, as: 'provider', attributes: [], include: { model: provider_info, attributes: [] } },
      {
        model: user,
        as: 'payment',
        attributes: [],
      },
    ],
    attributes: [
      'id',
      'start_at',
      'end_at',
      [col('provider.provider_info.provider_name'), 'provider_name'],
      [col('provider.user'), 'provider_phone'],
      [col('payment.full_name'), 'payment_name'],
      'total_price',
      'total_profit',
      'is_payment',
      'payment_at',
      [sequelize.literal('(SELECT COUNT(id) FROM salary_provider_order WHERE salary_provider_id = salary_provider.id)'), 'total_order'],
    ],
  });
  const rows = await order.findAll({
    attributes: [
      'id',
      'code',
      [col('service.name'), 'service_name'],
      [col('service.id'), 'service_id'],
      'adult',
      'children',
      'checkin_at',
      'checkout_at',
      'price',
    ],
    include: [
      { model: salary_provider_order, where: { salary_provider_id: id }, attributes: [] },
      { model: service, attributes: [] },
      { model: order_transaction },
      { model: order_surcharge },
    ],
    subQuery: false,
  });
  return { data: { detail: findSalary, listOrder: rows.slice(offset, offset + limit) }, paging: { page, count: rows.length, limit } };
}
async function getSalariesOfProvider(req, res) {
  let { toDate } = req.query;
  if (toDate) {
    toDate = new Date(Date.parse(toDate) + 86400000).toISOString();
  }
  return getListSalaryCreate(toDate);
}
async function getListSalary(req, res) {
  const { fromDate, search = '', is_payment, page = 1, limit = config.PAGING_LIMIT, offset = 0, provider_id } = req.query;
  let { toDate } = req.query;
  if (toDate) {
    toDate = new Date(Date.parse(toDate) + 86400000).toISOString();
  }
  const { rows, count } = await salary_provider.findAndCountAll({
    attributes: [
      'id',
      'start_at',
      'end_at',
      [col('provider.user'), 'provider_phone'],
      [col('provider.provider_info.provider_name'), 'provider_name'],
      [col('payment.full_name'), 'payment_name'],
      'total_price',
      'is_payment',
      'provider_id',
      'payment_at',
      [sequelize.literal('(SELECT COUNT(id) FROM salary_provider_order WHERE salary_provider_id = salary_provider.id)'), 'total_order'],
    ],
    where: {
      provider_id: provider_id || { [Op.ne]: null },
      is_payment: is_payment || { [Op.ne]: null },
      created_at: {
        [Op.and]: [
          fromDate ? { [Op.gte]: fromDate } : { [Op.ne]: null },
          toDate ? { [Op.lte]: toDate } : { [Op.ne]: null },
        ],
      },
    },
    include: [
      {
        model: user,
        as: 'provider',
        required: true,
        where: { full_name: { [Op.substring]: search } },
        attributes: [],
        include: { model: provider_info, attributes: [] },
      },
      {
        model: user,
        required: false,
        as: 'payment',
        attributes: [],
      },
    ],
    limit,
    offset,
  });
  const query = `SELECT
  (SELECT SUM(total_price) FROM salary_provider WHERE is_payment = 1 
  ${provider_id ? `AND sale_id = ${provider_id}` : ''}) AS payment,
  (SELECT SUM(total_price) FROM salary_provider WHERE is_payment = 0
  ${provider_id ? `AND sale_id = ${provider_id}` : ''}) AS unpay
  `;
  const profit = await sequelize.query(query, { type: QueryTypes.SELECT });
  const { payment, unpay } = profit[0];
  return { data: { payment: payment || 0, unpay: unpay || 0, salaries: rows }, paging: { page, count, limit } };
}
module.exports = {
  create,
  update,
  createOrUpdateProviderType,
  getListProviderType,
  deleteProviderType,
  getListProvider,
  getProviderDetail,
  getListOrder,
  deleteProvider,
  providerStatistic,
  updateProviderInfo,
  getSalariesOfSale,
  providerDetailStatistic,
  getListManagers,
  deleteManager,
  salaryOfProvider,
  getSalariesOfProvider,
  deleteSalary,
  getsalaryDetail,
  getListSalary,
  updatePayment,
};
