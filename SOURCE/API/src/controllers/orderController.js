/* eslint-disable max-len */
/* eslint-disable no-nested-ternary */
/* eslint-disable prettier/prettier */
/* eslint-disable indent */
/* eslint-disable operator-linebreak */
/* eslint-disable no-await-in-loop */
const {
  apiCode,
  IS_ACTIVE,
  ROLE,
  ORDER_STATUS,
  ORDER_WAITING,
  ORDER_PROCESSING,
  PAYMENT_STATUS,
  ORDER_HISTORY,
  ORDER_STATUS_OF_CUSTOMER,
  ORDER_STATUS_OF_SALE,
  ORDER_STATUS_OF_PROVIDER,
  REVIEW_TYPE,
  ORDER_STATUS_OF_ADMIN,
  NOTI_TYPE,
  USER_HISTORY_TYPE,
} = require('@utils/constant');
const {
  service,
  order,
  regions,
  config,
  user,
  order_customer,
  order_history,
  service_category,
  service_image,
  order_provider,
  df_order_transaction_type,
  order_transaction_history,
  order_transaction,
  order_review,
  order_surcharge,
  sale_info,
  provider_info,
  provider_type,
  customer_info,
} = require('@models/');
const Sequelize = require('sequelize');
const ExcelJS = require('exceljs');
const mediaController = require('@controllers/mediaController');
const notiController = require('@controllers/notiController');
const historyController = require('@controllers/historyController');
const Joi = require('joi');
const utils = require('@utils/utils');
const path = require('path');
const fs = require('fs');
const request = require('request');
const sequelize = require('../config/env');

const listStatus = Object.values(ORDER_STATUS);
const { Op, col, QueryTypes } = Sequelize;

async function createOrder(req, res) {
  const { auth } = req;
  const schema = Joi.object()
    .keys({
      customer_name: Joi.string().required(),
      customer_phone: Joi.string().required(),
      customer_address: Joi.string().empty('').required(),
      service_id: Joi.number().empty('').required(),
      checkin_at: Joi.string().empty(null).required(),
      checkout_at: Joi.string().empty('').required(),
    })
    .unknown(true);
  const {
    customer_name,
    customer_phone,
    customer_address,
    service_id,
    checkin_at,
    checkout_at,
    adult = 0,
    children = 0,
    point = 0,
    note = '',
  } = await schema.validateAsync(req.body);
  let { customer_id } = req.body;
  if (auth.role_id == ROLE.CUSTOMER) {
    customer_id = auth.id;
  }
  const findService = await service.findOne({
    where: { id: service_id, is_active: { [Op.ne]: IS_ACTIVE.INACTIVE }, status: 1 },
  });
  if (!findService) {
    throw apiCode.NOT_FOUND.withMessage('Dịch vụ tạm thời không hoạt động');
  }
  const code = `${`${Date.now()}`.substring(6)}${auth.id}`;
  const findOrder = await sequelize.transaction(async (transaction) => {
    const createBooking = await order.create(
      {
        customer_id,
        customer_name,
        customer_phone,
        customer_address,
        service_id,
        checkin_at,
        checkout_at,
        ...(adult && { adult }),
        ...(children && { children }),
        point,
        note,
        code,
      },
      { transaction }
    );
    if (findService.provider_id) {
      console.log('đã vào đây');
      await order_provider.create(
        { order_id: createBooking.id, provider_id: findService.provider_id },
        { transaction }
      );
    }
    return createBooking;
  });
  return orderDetail(findOrder.id, req);
}
async function orderDetail(id, req) {
  return order.findOne({ where: { id, is_active: { [Op.ne]: IS_ACTIVE.INACTIVE } } });
}
async function listOrder(req, res) {
  const { auth } = req;
  const { role_id } = auth;
  const {
    search = '',
    province_id,
    status,
    payment_status,
    checkin_at,
    is_tour,
    checkout_at,
    created_at,
    page = 1,
    limit = config.PAGING_LIMIT,
    offset = 0,
  } = req.query;
  let { sale_id, sale_leader_id } = req.query;
  const customer_id = role_id == ROLE.CUSTOMER ? auth.id : null;
  sale_id = role_id == ROLE.SALE ? auth.id : sale_id;
  sale_leader_id = role_id == ROLE.SALE_LEADER ? auth.id : sale_leader_id;
  const where = {
    is_active: IS_ACTIVE.ACTIVE,
    ...(status && { status }),
    ...(customer_id && { customer_id }),
    ...(payment_status && { payment_status }),
    ...(sale_id && { sale_id }),
    ...(sale_leader_id && { sale_leader_id }),
    ...(checkin_at && { checkin_at }),
    ...(checkout_at && { checkout_at }),
    ...(created_at && { created_at: { [Op.substring]: created_at } }),
    search: sequelize.literal(
      `(customer_name like '%${search}%' 
      OR order.code like '%${search}%' 
      OR service.name like '%${search}%' 
      OR service.code like '%${search}%')`
    ),
  };
  const { rows, count } = await order.findAndCountAll({
    where,
    attributes: [
      'id',
      'code',
      'adult',
      'children',
      'customer_name',
      'customer_phone',
      'checkin_at',
      'checkout_at',
      'price',
      'payment_status',
      'status',
      'created_at',
      [col('service.name'), 'service_name'],
      [col('service.code'), 'service_code'],
      [col('service.region.name'), 'region_name'],
    ],
    include: [
      {
        model: service,
        attributes: [],
        include: [
          { model: regions, attributes: [] },
          { model: service_category, where: { is_tour: is_tour || { [Op.ne]: 1 } } },
        ],
        where: { ...(province_id && { province_id }) },
      },
      { model: user, as: 'sale', attributes: ['id', 'full_name', ['user', 'phone'], 'email'] },
      { model: user, as: 'sale_leader', attributes: ['id', 'full_name', ['user', 'phone'], 'email'] },
    ],
    limit,
    offset,
    order: [['id', 'DESC']],
  });
  return { data: rows, paging: { page, count, limit } };
}

async function getOverView(req, res) {
  const { auth } = req;
  const { search = '', status, payment_status, checkin_at, is_tour, checkout_at, created_at } = req.query;
  let { provider_id, sale_id, sale_leader_id } = req.query;
  sale_id = auth.role_id == ROLE.SALE ? auth.id : sale_id;
  sale_leader_id = auth.role_id == ROLE.SALE_LEADER ? auth.id : sale_leader_id;
  if (auth.role_id == ROLE.PROVIDER) {
    const findProviderInfor = await provider_info.findOne({
      where: { provider_id: auth.id, parent_id: { [Op.ne]: null } },
    });
    provider_id = findProviderInfor ? findProviderInfor.parent_id : auth.id;
  }
  const customer_id = auth.role_id == ROLE.CUSTOMER ? auth.id : null;
  const where = {
    is_active: IS_ACTIVE.ACTIVE,
    ...(status && { status }),
    ...(customer_id && { customer_id }),
    ...(payment_status && { payment_status }),
    ...(sale_id && { sale_id }),
    ...(sale_leader_id && { sale_leader_id }),
    ...(checkin_at && { checkin_at }),
    ...(checkout_at && { checkout_at }),
    ...(created_at && { created_at: { [Op.substring]: created_at } }),
    search: sequelize.literal(
      `(customer_name like '%${search}%' 
      OR order.code like '%${search}%' 
      OR service.name like '%${search}%' 
      OR service.code like '%${search}%')`
    ),
  };
  const listOrders = await order
    .findAll({
      where,
      attributes: ['id'],
      include: [
        {
          model: service,
          attributes: [],
          include: [
            { model: regions, attributes: [] },
            { model: service_category, where: { is_tour: is_tour || { [Op.ne]: 1 } } },
          ],
        },
        {
          model: order_provider,
          where: { provider_id: provider_id || { [Op.ne]: null } },
        },
        { model: user, as: 'sale', attributes: [] },
        { model: user, as: 'sale_leader', attributes: [] },
      ],
    })
    .map((u) => u.id);

  const query = `SELECT
  (SELECT COUNT(id) FROM \`order\` where id IN (${listOrders.length > 0 ? listOrders : 0})) as total_order,

  (SELECT COUNT(id) FROM \`order\` where id IN (${listOrders.length > 0 ? listOrders : 0}) AND status = 10) as finished,
  
  (SELECT COUNT(id) FROM \`order\` where id IN (${listOrders.length > 0 ? listOrders : 0
    }) AND sale_id IS NULL) as not_assigned,

  (SELECT COUNT(id) FROM \`order\` where id IN (${listOrders.length > 0 ? listOrders : 0
    }) AND status != 10) as not_finish,

  (
    (SELECT CAST(SUM(amount) AS UNSIGNED) FROM \`order_transaction\` 
    where order_id IN (${listOrders.length > 0 ? listOrders : 0
    }) AND df_order_transaction_type_id IN (3) )
    + 
    (SELECT CAST(SUM(amount) AS UNSIGNED) FROM \`order_surcharge\` 
    where order_id IN (${listOrders.length > 0 ? listOrders : 0
    }))
  )
  as total_price,

  (
  (SELECT CAST(SUM(amount) AS UNSIGNED) FROM \`order_transaction\`
  JOIN \`order\` as o ON o.id = \`order_transaction\`.order_id AND o.payment_provider_at IS NULL
  where order_id IN (${listOrders.length > 0 ? listOrders : 0
    }) AND df_order_transaction_type_id IN (4))
    +
  (SELECT CAST(SUM(amount) AS UNSIGNED) FROM \`order_transaction\`
  JOIN \`order\` as o ON o.id = \`order_transaction\`.order_id AND o.payment_provider_at IS NOT NULL
  where order_id IN (${listOrders.length > 0 ? listOrders : 0
    }) AND df_order_transaction_type_id IN (3) )
    +
    (SELECT CAST(SUM(amount) AS UNSIGNED) FROM \`order_transaction\`
    where order_id IN (${listOrders.length > 0 ? listOrders : 0
      }) AND df_order_transaction_type_id IN (6) AND is_epay != 1 )
    + 
  (SELECT IF(SUM(amount) > 0 , CAST(SUM(amount) AS UNSIGNED) , 0)  FROM \`order_surcharge\`
  JOIN \`order\` as o ON o.id = \`order_surcharge\`.order_id AND o.payment_provider_at IS NOT NULL
    where order_id IN (${listOrders.length > 0 ? listOrders : 0
    }))  
  ) as amount_finished
  
  `;
  const data = await sequelize.query(query, { type: QueryTypes.SELECT });
  const output = data[0];
  output.remain = data[0].total_price - data[0].amount_finished;
  return output;
}

async function asign(req, res) {
  const { order_id, asign_to } = req.body;
  const { auth } = req;
  const sale_leader_id = auth.role_id == ROLE.ADMIN ? asign_to : null;
  const sale_id = auth.role_id == ROLE.SALE_LEADER ? asign_to : null;
  const role_id = auth.role_id == ROLE.ADMIN ? ROLE.SALE_LEADER : ROLE.SALE;
  const findOrder = await checkorder(order_id);
  const status = sale_leader_id ? ORDER_STATUS.CHANGE_TO_SALE_LEADER : ORDER_STATUS.SALE_CONFIRMED;
  const findUser = await user.findOne({ where: { id: asign_to, is_active: IS_ACTIVE.ACTIVE, role_id } });
  if (!findUser) {
    throw apiCode.NOT_FOUND.withMessage(
      `${auth.role_id == ROLE.ADMIN ? 'Vui lòng chỉ định cho sale leader' : 'Vui lòng chỉ định cho sale'}`
    );
  }
  if (findOrder.status >= ORDER_STATUS.CHECK_IN || findOrder.status == ORDER_STATUS.REJECTED) {
    throw apiCode.NOT_FOUND.withMessage('Đơn hàng không thể chỉ định');
  }
  await findOrder.update({ ...(sale_id && { sale_id }), ...(sale_leader_id && { sale_leader_id }), status });
  await notiController.createNotification({
    user_id: sale_id || sale_leader_id,
    metaData: { order_id },
    type: NOTI_TYPE.ASIGNED,
    context: findOrder.code,
  });
  const provider_id = null;
  await order_history.create({ order_id, status, ...(provider_id && { provider_id }) });
  return detail(order_id, req);
}
async function detail(order_id, req) {
  const fullUrl = utils.getUrl(req);
  const data = await order.findOne({
    attributes: [
      'id',
      'code',
      'adult',
      'children',
      'customer_name',
      'customer_phone',
      'customer_address',
      'payment_provider_at',
      'checkin_at',
      'checkout_at',
      'is_request_payment',
      'use_point',
      'end_payment_at',
      'price',
      [
        sequelize.literal(
          `(SELECT SUM(amount) FROM order_transaction 
          WHERE order_id = order.id 
          AND df_order_transaction_type_id IN (1,2)
          AND status = 2
          )
          `
        ),
        'dispose',
      ],
      [
        sequelize.literal(
          `(SELECT SUM(price) FROM order_surcharge
          WHERE order_id = order.id) `
        ),
        'accompanied_service',
      ],
      [
        sequelize.literal(
          `(SELECT COUNT(id) FROM order_review 
          WHERE order_id = order.id)`
        ),
        'is_review',
      ],
      [
        sequelize.literal(
          `(SELECT SUM(amount) FROM order_transaction 
          WHERE order_id = order.id
          AND status = 2
          AND df_order_transaction_type_id IN (6))`
        ),
        'service_charge_included',
      ],
      'note',
      'payment_status',
      'status',
      'created_at',
      [col('service.rating'), 'rating'],
      [col('service.id'), 'service_id'],
      [col('service.provider_id'), 'provider_id'],
      [col('service.name'), 'service_name'],
      [col('service.service_category.name'), 'service_category_name'],
      [sequelize.literal(`CONCAT ('${fullUrl}', \`service->service_images\`.path)`), 'service_image'],
      [col('service.code'), 'service_code'],
      [col('service.region.name'), 'region_name'],
    ],
    where: { id: order_id },
    include: [
      {
        model: service,
        attributes: ['id'],
        include: [
          { model: regions, attributes: [] },
          { model: service_category, attributes: [] },
          {
            model: service_image,
            where: { type: 1 },
            attributes: [],
          },
          {
            model: user,
            as: 'provider',
            attributes: [['user', 'provider_phone'], 'full_name'],
            include: { model: provider_info, attributes: ['provider_name'] },
          },
        ],
      },
      {
        model: user,
        as: 'sale',
        attributes: [
          'id',
          'full_name',
          ['user', 'phone'],
          'email',
          'key_chat',
          [
            sequelize.literal(
              `IF(LENGTH(\`sale->sale_info\`.profile_image) > 0,
CONCAT ('${fullUrl}', \`sale->sale_info\`.profile_image),'')`
            ),
            'profile_image',
          ],
        ],
        include: { model: sale_info, attributes: [] },
      },
      {
        model: user,
        as: 'customer',
        attributes: [
          'id',
          'full_name',
          ['user', 'phone'],
          'email',
          'key_chat',
          [
            sequelize.literal(
              `IF(LENGTH(\`customer->customer_info\`.profile_image) > 0,
CONCAT ('${fullUrl}', \`customer->customer_info\`.profile_image),'')`
            ),
            'profile_image',
          ],
        ],
        include: { model: customer_info, attributes: [] },
      },
      { model: user, as: 'sale_leader', attributes: ['id', 'full_name', ['user', 'phone'], 'email', 'key_chat'] },
      {
        required: false,
        model: order_review,
      },
      {
        required: false,
        model: order_history,
        attributes: ['status', 'created_at'],
        where: { status: { [Op.in]: [ORDER_STATUS.CHECK_OUT, ORDER_STATUS.CHECK_IN] } },
      },
    ],
  });
  const transaction = await getListTransaction(order_id, fullUrl);
  data.dataValues.enable_checkin = 0;
  data.dataValues.enable_checkout = 1;
  data.dataValues.transaction = transaction;
  data.dataValues.order_surcharges = await order_surcharge.findAll({ where: { order_id }, order: [['id', 'DESC']] });
  data.dataValues.order_customers = await order_customer.findAll({
    where: { order_id },
    order: [['is_leader', 'DESC'], ['id', 'DESC']],
    attributes: {
      include: [
        [
          sequelize.literal(
            `IF(LENGTH(font_id) > 0,
CONCAT ('${fullUrl}', font_id),'')`
          ),
          'font_id',
        ],
        [
          sequelize.literal(
            `IF(LENGTH(back_id) > 0,
CONCAT ('${fullUrl}', back_id),'')`
          ),
          'back_id',
        ],
      ],
    },
  });
  return data;
}

async function getListTransaction(order_id, fullUrl, listID = null) {
  return df_order_transaction_type.findAll({
    order: ['id', [col('order_transactions.id'), 'DESC']],
    where: { id: listID ? { [Op.in]: listID } : { [Op.ne]: null } },
    include: {
      model: order_transaction,
      where: { order_id },
      required: false,
      attributes: {
        include: [
          [
            sequelize.literal(
              `IF(LENGTH(order_transactions.transfer_image) > 0,
CONCAT ('${fullUrl}', order_transactions.transfer_image),
order_transactions.transfer_image)`
            ),
            'transfer_image',
          ],
          [
            sequelize.literal(
              `IF(LENGTH(order_transactions.sms_image) > 0,
CONCAT ('${fullUrl}', order_transactions.sms_image),
order_transactions.sms_image)`
            ),
            'sms_image',
          ],
        ],
      },
    },
  });
}
async function getDetail(req, res) {
  const { order_id } = req.query;
  const findOrder = await order.findOne({ where: { id: order_id } });
  if (!findOrder) {
    throw apiCode.NOT_FOUND;
  }
  const findService = await service.findOne({ where: { id: findOrder.service_id, service_category_id: 1 } });
  if (findService) {
    return tourDetail(order_id, req);
  }
  return detail(order_id, req);
}
async function tourDetail(order_id, req) {
  const { auth } = req;
  const fullUrl = utils.getUrl(req);
  const data = await order.findOne({
    attributes: [
      'id',
      'code',
      'adult',
      'children',
      'is_request_payment',
      'customer_name',
      'customer_phone',
      'customer_address',
      'payment_provider_at',
      'checkin_at',
      'checkout_at',
      'use_point',
      'end_payment_at',
      'price',
      [
        sequelize.literal(
          `(SELECT SUM(amount) FROM order_transaction 
          WHERE order_id = order.id 
          AND df_order_transaction_type_id IN (1,2))`
        ),
        'dispose',
      ],
      [
        sequelize.literal(
          `(SELECT SUM(price) FROM order_surcharge 
          WHERE order_id = order.id)`
        ),
        'accompanied_service',
      ],
      [
        sequelize.literal(
          `(SELECT COUNT(id) FROM order_review 
          WHERE order_id = order.id)`
        ),
        'is_review',
      ],
      [
        sequelize.literal(
          `(SELECT SUM(amount) FROM order_transaction 
          WHERE order_id = order.id
          AND status = 2
          AND df_order_transaction_type_id IN (6))`
        ),
        'service_charge_included',
      ],
      'note',
      'payment_status',
      'status',
      'created_at',
      [col('service.rating'), 'rating'],
      [col('service.id'), 'service_id'],
      [col('service.provider_id'), 'provider_id'],
      [col('service.name'), 'service_name'],
      [col('service.service_category.name'), 'service_category_name'],
      [sequelize.literal(`CONCAT ('${fullUrl}', \`service->service_images\`.path)`), 'service_image'],
      [col('service.code'), 'service_code'],
      [col('service.region.name'), 'region_name'],
    ],
    where: { id: order_id },
    include: [
      {
        model: service,
        attributes: [],
        include: [
          { model: regions, attributes: [] },
          { model: service_category, attributes: [] },
          {
            model: service_image,
            where: { type: 1 },
            attributes: [],
          },
        ],
      },
      {
        model: user,
        as: 'sale',
        attributes: [
          'id',
          'full_name',
          ['user', 'phone'],
          'email',
          'key_chat',
          [
            sequelize.literal(
              `IF(LENGTH(\`sale->sale_info\`.profile_image) > 0,
CONCAT ('${fullUrl}', \`sale->sale_info\`.profile_image),'')`
            ),
            'profile_image',
          ],
        ],
        include: { model: sale_info, attributes: [] },
      },
      {
        model: user,
        as: 'customer',
        attributes: [
          'id',
          'full_name',
          ['user', 'phone'],
          'email',
          'key_chat',
          [
            sequelize.literal(
              `IF(LENGTH(\`customer->customer_info\`.profile_image) > 0,
CONCAT ('${fullUrl}', \`customer->customer_info\`.profile_image),'')`
            ),
            'profile_image',
          ],
        ],
        include: { model: customer_info, attributes: [] },
      },
      { model: user, as: 'sale_leader', attributes: ['id', 'full_name', ['user', 'phone'], 'email'] },
      {
        required: false,
        attributes: [
          'id',
          'created_at',
          'is_payment',
          [sequelize.literal('`order_providers->user->provider_info`.provider_name'), 'provider_name'],
          [sequelize.literal('`order_providers->user`.user'), 'provider_phone'],
          [sequelize.literal('`order_providers->user`.full_name'), 'full_name'],
          [sequelize.literal('`order_providers->user->provider_info->provider_type`.name'), 'provider_type_name'],
          [sequelize.literal('`order_providers->user->provider_info->provider_type`.id'), 'provider_type_id'],
        ],
        model: order_provider,
        include: [
          {
            model: user,
            attributes: [],
            include: { model: provider_info, attributes: [], include: { model: provider_type, attributes: [] } },
          },
          {
            model: order_transaction,
            attributes: {
              include: [
                [
                  sequelize.literal(
                    `IF(LENGTH(\`order_providers->order_transactions\`.transfer_image) > 0,
      CONCAT ('${fullUrl}', \`order_providers->order_transactions\`.transfer_image),'')`
                  ),
                  'transfer_image',
                ],
                [
                  sequelize.literal(
                    `IF(LENGTH(\`order_providers->order_transactions\`.sms_image) > 0,
      CONCAT ('${fullUrl}', \`order_providers->order_transactions\`.sms_image),'')`
                  ),
                  'sms_image',
                ],
              ],
            },
            include: { model: df_order_transaction_type },
          },
        ],
      },
      {
        required: false,
        model: order_review,
        where: { service_id: { [Op.ne]: null } },
      },
      {
        required: false,
        model: order_history,
        attributes: ['status', 'created_at'],
        where: { status: { [Op.in]: [ORDER_STATUS.CHECK_OUT, ORDER_STATUS.CHECK_IN] } },
      },
    ],
  });
  const dataCheck = await checkINCheckOut(order_id, auth.id);
  data.dataValues.enable_checkin = dataCheck.enable_checkin;
  data.dataValues.enable_checkout = dataCheck.enable_checkout;
  data.dataValues.transaction = await getListTransaction(order_id, fullUrl, [1, 2, 6]);
  data.dataValues.order_surcharges = await order_surcharge.findAll({ where: { order_id }, order: [['id', 'DESC']] });
  data.dataValues.order_customers = await order_customer.findAll({
    where: { order_id },
    order: [['is_leader', 'DESC'], ['id', 'DESC']],
    attributes: {
      include: [
        [
          sequelize.literal(
            `IF(LENGTH(font_id) > 0,
CONCAT ('${fullUrl}', font_id),'')`
          ),
          'font_id',
        ],
        [
          sequelize.literal(
            `IF(LENGTH(back_id) > 0,
CONCAT ('${fullUrl}', back_id),'')`
          ),
          'back_id',
        ],
      ],
    },
  });
  return data;
}
async function checkINCheckOut(order_id, provider_id) {
  const findUserProvider = await provider_info.count({ where: { provider_id, provider_type_id: 2 } });
  const findCheckIn = await order_history.findOne({ where: { provider_id, status: ORDER_STATUS.CHECK_IN, order_id } });
  return { enable_checkin: findCheckIn ? 0 : 1, enable_checkout: findUserProvider };
}

async function checkCustomer(listCustomers, findOrder) {
  const countAdult = await listCustomers.filter((u) => u.type == 1 || u.type == '1');
  const countChildrent = await listCustomers.filter((u) => u.type == 2 || u.type == '2');
  console.log(findOrder.adult, findOrder.children);
  if (countAdult.length != findOrder.adult || countChildrent.length != findOrder.children) {
    throw apiCode.UPDATE_FAIL.withMessage('Vui lòng nhập đúng số lượng người lớn và trẻ em');
  }
}
async function orderCustomer(req, res) {
  const { listCustomers, order_id } = req.body;
  const findOrder = await checkorder(order_id);
  await checkCustomer(listCustomers, findOrder);
  const listUpdate = listCustomers.filter((item) => item.id > 0);
  const listupdateID = listUpdate.map((v) => v.id);
  const listCreate = listCustomers
    .filter((item) => !item.id)
    .map((v) => ({
      name: v.name,
      identify: v.identify,
      type: v.type,
      order_id,
      year: v.year,
      old: v.old,
    }));
  console.log(listCreate);
  await sequelize.transaction(async (transaction) => {
    await order_customer.destroy({ where: { id: { [Op.notIn]: listupdateID }, order_id } }, { transaction });
    for (let i = 0; i < listUpdate.length; i++) {
      const { name, identify, year, old } = listUpdate[i];
      await order_customer.update(
        { name, identify, year, old },
        { where: { order_id, id: listUpdate[i].id }, transaction }
      );
    }
    await order_customer.bulkCreate(listCreate, { transaction });
  });
  return detail(order_id, req);
}
async function orderCustomerV2(req, res) {
  const { name, order_id, identify, type, year, old, id } = req.body;
  let { font_id, back_id, is_leader = 0 } = req.body;
  is_leader = parseInt(is_leader, 10);
  const fullUrl = utils.getUrl(req);
  if (!font_id) {
    font_id = await mediaController.uploadMediaWithName(req, 'font_id');
  } else {
    font_id = font_id.replace(fullUrl, '');
  }
  if (!back_id) {
    back_id = await mediaController.uploadMediaWithName(req, 'back_id');
  } else {
    back_id = back_id.replace(fullUrl, '');
  }
  if (parseInt(is_leader, 10) == 1 && (!font_id || !back_id || !identify)) {
    throw apiCode.UPDATE_FAIL.withMessage('Vui lòng điền đầy đủ thông tin của trưởng đoàn');
  }
  if (parseInt(is_leader, 10) == 1) {
    await order_customer.update({ is_leader: 0 }, { where: { order_id } });
  }
  if (id && parseInt(id, 10) > 0) {
    await order_customer.update(
      {
        name,
        identify,
        is_leader,
        type,
        year,
        old,
        font_id,
        back_id,
      },
      { where: { id } }
    );
  } else {
    await order_customer.create({
      name,
      identify,
      is_leader,
      type,
      year,
      order_id,
      old,
      ...(font_id && { font_id }),
      ...(back_id && { back_id }),
    });
  }
  return detail(order_id, req);
}

async function deleteImage(req, res) {
  const { id, is_font_id, is_back_id } = req.body;
  const update = {};
  if (is_font_id) {
    update.font_id = '';
  }
  if (is_back_id) {
    update.back_id = '';
  }
  await order_customer.update(update, { where: { id } });
}
async function deleteOrderCustomer(req, res) {
  const { listID, order_id } = req.body;
  await order_customer.destroy({ where: { id: { [Op.in]: listID }, order_id } });
  return detail(order_id, req);
}
async function checkStatus({ role_id, status, findOrder }) {
  if (role_id == ROLE.CUSTOMER && !ORDER_STATUS_OF_CUSTOMER.includes(status)) {
    throw apiCode.NO_PERMISSION;
  }
  if (role_id == ROLE.PROVIDER && !ORDER_STATUS_OF_PROVIDER.includes(status)) {
    throw apiCode.NO_PERMISSION;
  }
  if (role_id == ROLE.SALE && !ORDER_STATUS_OF_SALE.includes(status)) {
    throw apiCode.NO_PERMISSION;
  }
  if ([ROLE.ADMIN, ROLE.SALE_LEADER].includes(role_id) && !ORDER_STATUS_OF_ADMIN.includes(status)) {
    throw apiCode.NO_PERMISSION;
  }
  console.log({ role_id, status, findOrder });
  switch (status) {
    case ORDER_STATUS.SALE_CONFIRMED:
      if (findOrder.status != ORDER_STATUS.CHANGE_TO_SALE) throw apiCode.NO_PERMISSION;
      break;
    case ORDER_STATUS.SALE_REJECTED:
      if (findOrder.status != ORDER_STATUS.CHANGE_TO_SALE) throw apiCode.NO_PERMISSION;
      break;
    case ORDER_STATUS.CHECK_IN:
      if (![ORDER_STATUS.SALE_CONFIRMED, ORDER_STATUS.CHECK_IN].includes(findOrder.status)) {
        throw apiCode.NO_PERMISSION;
      }
      break;
    case ORDER_STATUS.CHECK_OUT:
      if (findOrder.status != ORDER_STATUS.CHECK_IN) throw apiCode.NO_PERMISSION;
      break;
    case ORDER_STATUS.FINISHED:
      if (findOrder.status != ORDER_STATUS.CHECK_OUT) throw apiCode.NO_PERMISSION;
      break;
    default:
      break;
  }
}

async function checkorder(order_id, transaction_type_id, role_id) {
  const findOrder = await order.findOne({ where: { id: order_id, is_active: { [Op.ne]: IS_ACTIVE.INACTIVE } } });
  if (!findOrder) {
    throw apiCode.NOT_FOUND;
  }
  console.log('data', { role_id, transaction_type_id });
  if (role_id && transaction_type_id) {
    if (
      (role_id == ROLE.CUSTOMER && ![1, 2].includes(transaction_type_id)) ||
      (role_id != ROLE.CUSTOMER && [1, 2].includes(transaction_type_id))
    ) {
      throw apiCode.UPDATE_FAIL.withMessage('Không tìm thấy phương thức thanh toán');
    }
    if (role_id == ROLE.CUSTOMER) {
      const datenow = Date.now();
      const findOrderTransaction = await order.findOne({
        where: {
          id: order_id,
          is_active: { [Op.ne]: IS_ACTIVE.INACTIVE },
          start_payment_at: { [Op.lte]: datenow },
          end_payment_at: { [Op.gte]: datenow },
        },
        attributes: ['id'],
      });
      const findTransaction = await order_transaction.findAll({
        where: { order_id, df_order_transaction_type_id: { [Op.in]: [1, 2] }, status: { [Op.in]: [1, 2] } },
      });
      if (!findOrderTransaction) {
        throw apiCode.UPDATE_FAIL.withMessage(
          'Thời gian thanh toán của bạn đã hết. Vui lòng liên hệ với sale của chúng tôi để cập nhật loại'
        );
      }
      if (findTransaction.length) {
        throw apiCode.UPDATE_FAIL.withMessage('Bạn đã đặt cọc thành công cho dịch vụ này');
      }
    }
  }
  return findOrder;
}

async function updatePrice(req, res) {
  const { order_id, price, adult, child } = req.body;
  const findOrder = await checkorder(order_id);
  await findOrder.update({
    price,
    ...(adult && { adult }),
    ...(child && { children: child }),
  });
  await notiController.createNotification({
    user_id: findOrder.customer_id,
    metaData: {
      order_id,
      status: findOrder.status,
    },
    context: findOrder.code,
    type: NOTI_TYPE.CAN_PAYMENT,
  });
  return detail(order_id, req);
}
async function resetpaymentTime(req, res) {
  const { order_id } = req.body;
  const findOrder = await checkorder(order_id);
  const start_payment_at = new Date();
  const end_payment_at = new Date();
  end_payment_at.setTime(start_payment_at.getTime() + 15 * 60 * 1000);
  await findOrder.update({ start_payment_at, end_payment_at, payment_status: 1 });
  await notiController.createNotification({
    user_id: findOrder.customer_id,
    metaData: {
      order_id,
      status: findOrder.status,
    },
    context: findOrder.code,
    type: NOTI_TYPE.CAN_PAYMENT,
  });
  return detail(order_id, req);
}
async function getListTransactionType(req, res) {
  return df_order_transaction_type.findAll();
}
async function updateStatus(req, res) {
  const { auth } = req;
  const { order_id, status } = req.body;
  const findOrder = await checkorder(order_id);
  if (findOrder.status == ORDER_STATUS.REJECTED) {
    throw apiCode.UPDATE_FAIL.withMessage('Đơn hàng đã bị huỷ');
  }
  await checkStatus({ role_id: auth.role_id, status, findOrder });
  if (!listStatus.includes(status)) {
    throw apiCode.NOT_FOUND;
  }
  await sequelize.transaction(async (transaction) => {
    await findOrder.update({ status }, { transaction });
    let provider_id = null;
    if (auth.role_id == ROLE.PROVIDER) {
      provider_id = auth.id;
    }
    await order_history.create({ order_id, status, ...(provider_id && { provider_id }) }, { transaction });
    if (status == ORDER_STATUS.CHECK_OUT && findOrder.payment_status == PAYMENT_STATUS.SUCCESS_ALL) {
      const findSale = await sale_info.findOne({ where: { sale_id: findOrder.sale_id } });
      await findOrder.update(
        { status: ORDER_STATUS.FINISHED, profit: (findOrder.price * findSale.profit) / 100 },
        { transaction }
      );
      await order_history.create({ order_id, status: ORDER_STATUS.FINISHED }, { transaction });
      console.log('đã vào đây');
      const customer_profit = await config.findOne({ where: { id: 4 } });
      await historyController.createHistory({
        customer_id: findOrder.customer_id,
        point: (findOrder.price * customer_profit.value) / 100,
        type: USER_HISTORY_TYPE.PROFIT,
        findOrder,
        transaction,
      });
      if (findOrder.sale_id) {
        await historyController.createHistory({
          sale_id: findOrder.sale_id,
          point: findOrder.price * findSale.profit,
          type: USER_HISTORY_TYPE.PROFIT,
          findOrder,
          transaction,
        });
      }
      await notiController.createNotificationWithTransaction(
        {
          user_id: findOrder.customer_id,
          metadata: { order_id: findOrder.order_id },
          type: NOTI_TYPE.SUCCESS,
          context: findOrder.code,
        },
        { transaction }
      );
    }
    if (status == ORDER_STATUS.REJECTED) {
      if (findOrder.use_point > 0) {
        await historyController.createHistory({
          customer_id: findOrder.customer_id,
          point: findOrder.use_point,
          type: USER_HISTORY_TYPE.ROLL_BACK,
          findOrder,
          transaction,
        });
      }
      await notiController.createNotificationWithTransaction(
        {
          user_id: findOrder.customer_id,
          metadata: { order_id: findOrder.order_id },
          type: NOTI_TYPE.CANCEL,
          context: findOrder.code,
        },
        { transaction }
      );
    }
    console.log(status);
  });
  return detail(order_id, req);
}

async function createTransaction(req, res) {
  const schema = Joi.object()
    .keys({
      order_id: Joi.number().required(),
      df_order_transaction_type_id: Joi.number().required(),
    })
    .unknown(true);
  const {
    order_id,
    df_order_transaction_type_id,
    amount,
    price,
    bank,
    sms,
    epay,
    provider_id,
    use_point = 0,
  } = await schema.validateAsync(req.body);
  const find_df_order_transaction_type = await df_order_transaction_type.findOne({
    where: { id: df_order_transaction_type_id },
  });
  if (!find_df_order_transaction_type) {
    throw apiCode.NOT_FOUND.withMessage('Không tìm thấy phương thức thanh toán');
  }
  // await checkorder(order_id, df_order_transaction_type_id, auth.role_id);
  const findOrder = await order.findOne({ where: { id: order_id } });
  if (df_order_transaction_type_id == 1 && ![PAYMENT_STATUS.SUCCESS, PAYMENT_STATUS.ACCEPT_FOR_DESPOSIT].includes(findOrder.payment_status)) {
    throw apiCode.UPDATE_FAIL.withMessage('Bạn chưa được phép đặt cọc cho đơn hàng này');
  }
  const transfer_image = await mediaController.uploadMediaWithName(req, 'transfer');
  // if (!transfer_image) {
  //   throw apiCode.NOT_FOUND.withMessage('Vui lòng đẩy ảnh chuyển khoản lên');
  // }
  const sms_image = await mediaController.uploadMediaWithName(req, 'transfer_sms');
  let payment_status = null;
  if (df_order_transaction_type_id == 1) {
    payment_status = PAYMENT_STATUS.SUCCESS;
  }

  await sequelize.transaction(async (transaction) => {
    const orderTransaction = await order_transaction.create(
      {
        order_id,
        df_order_transaction_type_id,
        ...(amount && { amount }),
        ...(price && { price }),
        ...(provider_id && { provider_id }),
        ...(bank && { bank }),
        ...(sms && { sms }),
        ...(transfer_image && { transfer_image }),
        ...(sms_image && { sms_image }),
        is_epay: epay == null ? 1 : epay,
      },
      { transaction }
    );
    await order_transaction_history.create(
      {
        order_transaction_id: orderTransaction.id,
        status: 1,
        ...(amount && { amount }),
        ...(price && { price }),
        ...(provider_id && { provider_id }),
        ...(bank && { bank }),
        ...(sms && { sms }),
        ...(transfer_image && { transfer_image }),
        ...(sms_image && { sms_image }),
        ...(epay && { epay }),
      },
      { transaction }
    );
    const payment_provider_at = df_order_transaction_type_id == 5 ? Date.Now() : findOrder.payment_provider_at;
    await order.update(
      { ...(use_point && { use_point }), ...(payment_status && { payment_status }), payment_provider_at },
      { where: { id: order_id }, transaction }
    );
    if (use_point) {
      await historyController.createHistory({
        customer_id: findOrder.customer_id,
        point: -use_point,
        type: USER_HISTORY_TYPE.USE_POINT,
        findOrder,
        transaction,
      });
    }
  });
  if (payment_status == PAYMENT_STATUS.SUCCESS) {
    console.log('đã chạy vào đây', { sale_id: findOrder.sale_id, customer_id: findOrder.customer_id });
    if (findOrder.sale_id) {
      await notiController.createNotification({
        user_id: findOrder.sale_id,
        metaData: { order_id },
        type: NOTI_TYPE.DESPOSIT,
        context: findOrder.code,
      });
    }
  }
  if (payment_status) {
    await notiController.createNotification({
      user_id: findOrder.customer_id,
      metaData: { order_id },
      type: NOTI_TYPE.DESPOSIT_CUSTOMER,
      context: findOrder.code,
    });
  }
  if ([1, 2, 6].includes(df_order_transaction_type_id)) {
    await notiController.pushSocket({
      order_id,
      user_id: findOrder.customer_id,
      type: 9,
      context: 'Khách hàng đã thanh toán dịch vụ',
    });
  } else {
    const findService = await service.findOne({ where: { id: findOrder.service_id } });
    if (findService && findService.provider_id) {
      await notiController.createNotification({
        user_id: findService.provider_id,
        metaData: { order_id, user_id: findService.provider_id },
        type: 11,
        context: `${find_df_order_transaction_type.name} đã được cập nhật`,
      });
    }
  }
  return detail(order_id, req);
}

async function list({
  provider_id,
  sale_id,
  sale_leader_id,
  customer_id,
  search = '',
  page = 1,
  status,
  limit = config.PAGING_LIMIT,
  offset = 0,
  req,
}) {
  let listOrderStatus = [];
  switch (status) {
    case '1': // ORDER_WAITING
      listOrderStatus = ORDER_WAITING;
      break;
    case '2': // ORDER_PROCESSING
      listOrderStatus = ORDER_PROCESSING;
      break;
    case '3': // ORDER_HISTORY
      listOrderStatus = ORDER_HISTORY;
      break;
    default:
      listOrderStatus = listStatus;
  }
  const fullUrl = utils.getUrl(req);
  const where = {
    is_active: IS_ACTIVE.ACTIVE,
    code: { [Op.substring]: search },
    ...(customer_id && { customer_id }),
    ...(sale_id && { sale_id }),
    ...(sale_leader_id && { sale_leader_id }),
    status: { [Op.in]: listOrderStatus },
  };
  console.log(where);
  const rows = await order.findAll({
    where,
    attributes: [
      'id',
      'code',
      'adult',
      'children',
      'customer_name',
      'customer_phone',
      'customer_address',
      'checkin_at',
      'checkout_at',
      'price',
      'payment_status',
      'status',
      'created_at',
      [col('service.name'), 'service_name'],
      [sequelize.literal(`CONCAT ('${fullUrl}', \`service->service_images\`.path)`), 'service_image'],
      [col('service.code'), 'service_code'],
      [col('service.region.name'), 'region_name'],
    ],
    include: [
      {
        model: order_provider,
        required: !!provider_id,
        attributes: [],
        where: { ...(provider_id && { provider_id }) },
      },
      {
        model: service,
        attributes: [],
        include: [
          { model: regions, attributes: [] },
          { model: service_image, attributes: [], where: { type: 1 } },
        ],
        required: true,
      },
      { model: user, required: false, as: 'sale', attributes: ['id', 'full_name', ['user', 'phone'], 'email'] },
      { model: user, required: false, as: 'sale_leader', attributes: ['id', 'full_name', ['user', 'phone'], 'email'] },
    ],
    subQuery: false,
    order: [['id', 'DESC']],
  });
  return { data: rows.slice(offset, offset + limit), paging: { page, count: rows.length, limit } };
}

async function testPushSocket(req, res) {
  return notiController.pushSocket({
    order_id: 1,
    user_id: 2,
    type: 9,
    context: 'Khách hàng đã thanh toán dịch vụ',
  });
}
async function getOrderCode(req, res) {
  const { code } = req.query;
  const findOrder = await order.findOne({ where: { code } });
  return findOrder ? findOrder.id : null;
}

async function updateTransaction(req, res) {
  const schema = Joi.object()
    .keys({
      id: Joi.number().required(),
      status: Joi.number().required(),
    })
    .unknown(true);
  const { id, price, amount, status, sms, bank, note, bank_id } = await schema.validateAsync(req.body);
  const findOrderTransaction = await order_transaction.findOne({ where: { id } });
  if (!findOrderTransaction) {
    throw apiCode.NOT_FOUND;
  }
  const sms_image = await mediaController.uploadMediaWithName(req, 'transfer_sms');
  const transfer_image = await mediaController.uploadMediaWithName(req, 'transfer');
  const findOrder = await order.findOne({ where: { id: findOrderTransaction.order_id } });
  const order_id = await sequelize.transaction(async (transaction) => {
    await findOrderTransaction.update(
      {
        price,
        status,
        ...(sms && { sms }),
        ...(bank && { bank }),
        ...(amount && { amount }),
        ...(sms_image && { sms_image }),
        ...(transfer_image && { transfer_image }),
        ...(note && { note }),
        bank_id,
      },
      { transaction }
    );
    if (findOrderTransaction.df_order_transaction_type_id == 1 && findOrder.payment_status == PAYMENT_STATUS.ACCEPT_FOR_DESPOSIT) {
      const payment_status = status == 2 ? PAYMENT_STATUS.SUCCESS : PAYMENT_STATUS.FALSE;
      await order.update({ payment_status }, { where: { id: findOrderTransaction.order_id }, transaction });
    }
    await order_transaction_history.create(
      {
        order_transaction_id: id,
        price,
        status,
        ...(sms && { sms }),
        ...(bank && { bank }),
        ...(amount && { amount }),
        ...(sms_image && { sms_image }),
        ...(note && { note }),
      },
      { transaction }
    );
    return findOrderTransaction.order_id;
  });
  return detail(order_id, req);
}

async function review(req, res) {
  const { auth } = req;
  const { order_id, rateService, noteService, noteSale, rateSale } = req.body;
  const findOrder = await order.findOne({ where: { id: order_id, customer_id: auth.id } });
  if (!findOrder) {
    throw apiCode.NOT_FOUND;
  }
  if (findOrder.status !== ORDER_STATUS.FINISHED) {
    throw apiCode.UPDATE_FAIL.withMessage('Bạn chưa thể đánh giá dịch vụ này');
  }
  const findReview = await order_review.findOne({ where: { order_id } });
  if (findReview) {
    throw apiCode.UPDATE_FAIL.withMessage('Bạn đã đánh giá dịch vụ này');
  }
  const { service_id, sale_id } = findOrder;

  const createReview = [
    { order_id, rating: rateService, note: noteService, type: 1, customer_id: auth.id, service_id },
    { order_id, rating: rateSale, note: noteSale, type: 1, customer_id: auth.id, sale_id },
  ];

  await order_review.bulkCreate(createReview);
  await updateRating({ service_id, sale_id });
  return detail(order_id, req);
}
async function updateRating({ service_id, sale_id }) {
  if (service_id) {
    const findOrderreview = await order_review.findOne({
      where: { type: REVIEW_TYPE.SERVICE, service_id },
      attributes: [
        [sequelize.fn('SUM', col('rating')), 'rating'],
        [sequelize.fn('COUNT', 'id'), 'count'],
      ],
    });
    const rating = findOrderreview.rating / findOrderreview.dataValues.count;
    await service.update({ rating }, { where: { id: service_id } });
  }
  if (sale_id) {
    const findOrderreview = await order_review.findOne({
      where: { type: REVIEW_TYPE.SALE, sale_id },
      attributes: [
        [sequelize.fn('SUM', col('rating')), 'rating'],
        [sequelize.fn('COUNT', 'id'), 'count'],
      ],
    });
    const rating = findOrderreview.rating / findOrderreview.dataValues.count;
    await sale_info.update({ rating }, { where: { sale_id } });
  }
}

async function transactionDetail(req, res) {
  const fullUrl = utils.getUrl(req);
  const { id } = req.query;
  return order_transaction_history.findAll({
    where: { order_transaction_id: id },
    attributes: [
      'id',
      'status',
      'created_at',
      'sms',
      'note',
      [
        sequelize.literal(`IF(LENGTH(transfer_image) > 0,CONCAT ('${fullUrl}', transfer_image),transfer_image)`),
        'transfer_image',
      ],
      [sequelize.literal(`IF(LENGTH(sms_image) > 0,CONCAT ('${fullUrl}', sms_image),sms_image)`), 'sms_image'],
    ],
    order: [['id', 'DESC']],
  });
}

async function createOrUpdateSurcharge(req, res) {
  const { order_id, price, amount, note, id } = req.body;
  await checkorder(order_id);
  if (id) {
    const findSurcharge = await order_surcharge.findOne({ where: { id } });
    if (!findSurcharge) {
      throw apiCode.NOT_FOUND;
    }
    await findSurcharge.update({ price, amount, note });
    return detail(order_id, req);
  }
  await order_surcharge.create({ order_id, price, amount, note });
  return detail(order_id, req);
}

async function updatePaymentStatus(req, res) {
  const { order_id, type } = req.body;
  const finfOrder = await checkorder(order_id);
  const payment_status = type ? PAYMENT_STATUS.SUCCESS_ALL : PAYMENT_STATUS.CAN_CHECK_IN;
  await finfOrder.update({ payment_status });
  return detail(order_id, req);
}

async function changePaymentStatus(req, res) {
  const { order_id, payment_status } = req.body;
  if (![PAYMENT_STATUS.CAN_CHECK_IN, PAYMENT_STATUS.ACCEPT_FOR_DESPOSIT, PAYMENT_STATUS.DESPOSIT_SUCCESS].includes(payment_status)) {
    throw apiCode.INVALID_PARAM;
  }
  console.log('đã chạy vào đây');
  const findOrder = await order.findOne({ where: { id: order_id } });
  let messageType = null;
  if (payment_status == PAYMENT_STATUS.ACCEPT_FOR_DESPOSIT) {
    messageType = NOTI_TYPE.ACCEPT_FOR_DESPOSIT;
    if (findOrder.payment_status != PAYMENT_STATUS.UNPAID) {
      throw apiCode.INVALID_PARAM;
    }
    const whereOrder = {
      id: { [Op.ne]: order_id },
      service_id: findOrder.service_id,
      [Op.or]: [
        { [Op.and]: [{ checkin_at: { [Op.gte]: findOrder.checkin_at } }, { checkin_at: { [Op.lt]: findOrder.checkout_at } }] },
        { [Op.and]: [{ checkout_at: { [Op.gt]: findOrder.checkin_at } }, { checkout_at: { [Op.lt]: findOrder.checkout_at } }] },
      ],
    };
    const ordersDesposited = await order.findOne({
      where: {
        ...whereOrder,
        payment_status: PAYMENT_STATUS.ACCEPT_FOR_DESPOSIT,
        start_payment_at: { [Op.lte]: Date.now() },
        end_payment_at: { [Op.gte]: Date.now() },
      },
    });
    if (ordersDesposited) {
      throw apiCode.UPDATE_FAIL.withMessage(`Đơn ${ordersDesposited.code} đang trong thời gian đặt cọc
      \n Oho sẽ đợi bạn 15 phút để chuyển khoản`);
    }
    const ordersDespositSuccess = await order.findOne({
      where: {
        ...whereOrder,
        payment_status: { [Op.in]: [4, 6, 7] },
      },
    });
    if (ordersDespositSuccess) {
      throw apiCode.UPDATE_FAIL.withMessage('Địch vụ đã có người khác đặt cọc');
    }
  }
  if (payment_status == PAYMENT_STATUS.DESPOSIT_SUCCESS) {
    messageType = NOTI_TYPE.DESPOSIT_SUCCESS;
    if (findOrder.payment_status != PAYMENT_STATUS.SUCCESS) {
      throw apiCode.INVALID_PARAM;
    }
    const findOrderTrasaction = await order_transaction.findOne({
      where:
      {
        order_id,
        df_order_transaction_type_id: { [Op.in]: [1, 6] },
        is_epay: 1,
        status: 2,
        amount: { [Op.ne]: null },
      },
      attributes: [[sequelize.fn('SUM', col('amount')), 'amount']],
    });
    if (!findOrderTrasaction || parseInt(findOrderTrasaction.amount, 10) < findOrder.price * 0.7) {
      throw apiCode.UPDATE_FAIL.withMessage('Đơn hàng chưa đặt cọc đủ số tiền');
    }
  }
  if (payment_status == PAYMENT_STATUS.CAN_CHECK_IN) {
    messageType = NOTI_TYPE.CAN_CHECK_IN;
    if (findOrder.payment_status != PAYMENT_STATUS.DESPOSIT_SUCCESS) {
      throw apiCode.INVALID_PARAM;
    }
    const findOrderTrasaction = await order_transaction.findOne({
      where:
      {
        order_id,
        df_order_transaction_type_id: { [Op.in]: [1, 2, 6] },
        is_epay: 1,
        status: 2,
        amount: { [Op.ne]: null },
      },
      attributes: [[sequelize.fn('SUM', col('amount')), 'amount']],
    });
    if (!findOrderTrasaction || parseInt(findOrderTrasaction.amount, 10) <= findOrder.price) {
      throw apiCode.UPDATE_FAIL.withMessage('Đơn hàng chưa thanh toán đủ số tiền');
    }
  }
  const updateData = { payment_status };
  if (payment_status == PAYMENT_STATUS.ACCEPT_FOR_DESPOSIT) {
    updateData.start_payment_at = new Date();
    const end_payment_at = new Date();
    end_payment_at.setTime(new Date().getTime() + 15 * 60 * 1000);
    updateData.end_payment_at = end_payment_at;
  }
  await order.update(updateData, { where: { id: order_id } });
  await notiController.createNotification({
    user_id: findOrder.customer_id,
    metaData: { order_id, user_id: findOrder.customer_id },
    type: messageType,
    context: findOrder.code,
  });
}
async function exportOrderCustomer(req, res) {
  const { order_id } = req.query;
  const fullUrl = utils.getUrl(req);
  const findOrder = await order_customer.findAll({
    where: { order_id },
    order: [['is_leader', 'DESC'], ['id', 'DESC']],
  });
  const PUBLIC = 'public';
  const listImage = [];
  for (let i = 0; i < findOrder.length; i++) {
    if (findOrder[i].back_id && findOrder[i].back_id.length > 15) {
      const back_id = path.join(PUBLIC, findOrder[i].back_id);
      listImage.push(back_id);
      await downloadFile(
        `${fullUrl}${findOrder[i].back_id}`,
        back_id
      );
    }
    if (findOrder[i].font_id && findOrder[i].font_id.length > 15) {
      const font_id = path.join(PUBLIC, findOrder[i].font_id);
      listImage.push(font_id);
      await downloadFile(
        `${fullUrl}${findOrder[i].font_id}`,
        font_id
      );
    }
  }
  await exportFile(findOrder);
  for (let i = 0; i < listImage.length; i++) {
    fs.unlink(listImage[i], () => { });
  }
  const pathFile = path.join(PUBLIC, 'samples', 'export_data.xlsx');
  const samplePath = path.resolve(pathFile);
  res.download(samplePath, (error) => {
  });
}

async function downloadFile(uri, filename) {
  const stream = request(uri);
  const download = fs.createWriteStream(filename);
  return new Promise((resolve, reject) => {
    stream.pipe(download);
    let error = null;
    download.on('error', (err) => {
      error = err;
      download.close();
      reject(err);
    });
    download.on('close', () => {
      if (!error) {
        resolve(true);
      }
    });
  });
}

async function exportFile(dataCustomer) {
  const dataField = ['STT', 'Họ và tên', 'Số CMND', 'Tuổi', 'Ảnh CMND mặt trước', 'Ảnh CMND mặt sau'];
  const PUBLIC = 'public';
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('1');
  const dataFilter = {
    type: 'pattern',
    pattern: 'solid',
    with: 140,
    fgColor: {
      argb: '78a6f0',
    },
    bgColor: {
      argb: '78a6f0',
    },
  };
  const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < dataField.length; i++) {
    const row = upperChars.substr(i, 1);
    worksheet.getCell(`${row}1`).fill = dataFilter;
  }
  worksheet.columns = dataField.map((i) => ({ header: i, width: 25 }));
  for (let i = 0; i < dataCustomer.length; i++) {
    worksheet.addRow([i + 1, dataCustomer[i].name, dataCustomer[i].identify, dataCustomer[i].old]);
    const row = worksheet.getRow(i + 2);
    row.height = 90;
    if (dataCustomer[i].font_id && dataCustomer[i].font_id.length > 15) {
      const imageFontId = workbook.addImage({
        filename: path.join(PUBLIC, dataCustomer[i].font_id),
        extension: 'jpeg',
      });
      worksheet.addImage(imageFontId, { tl: { col: 4, row: i + 1 }, ext: { width: 140, height: 90 } });
    }
    if (dataCustomer[i].back_id && dataCustomer[i].back_id.length > 15) {
      const imageBackId = workbook.addImage({
        filename: path.join(PUBLIC, dataCustomer[i].back_id),
        extension: 'jpeg',
      });
      worksheet.addImage(imageBackId, { tl: { col: 5, row: i + 1 }, ext: { width: 140, height: 90 } });
    }
  }
  const pathFile = path.join(PUBLIC, 'samples', 'export_data.xlsx');
  await workbook.xlsx.writeFile(pathFile);
  console.log('done');
  return workbook;
}

async function requestPament(req, res) {
  const { auth } = req;
  const { order_id } = req.body;
  const findOrder = await order.findOne({ where: { id: order_id, customer_id: auth.id } });
  if (!findOrder) {
    throw apiCode.NOT_FOUND;
  } else {
    order.update({ is_request_payment: 1 }, { where: { id: order_id } });
  }
  return true;
}

module.exports = {
  createOrder,
  listOrder,
  asign,
  getDetail,
  orderCustomer,
  orderCustomerV2,
  deleteOrderCustomer,
  updatePrice,
  getListTransactionType,
  updateStatus,
  createTransaction,
  getOverView,
  list,
  getOrderCode,
  updateTransaction,
  review,
  resetpaymentTime,
  transactionDetail,
  createOrUpdateSurcharge,
  updatePaymentStatus,
  getListTransaction,
  tourDetail,
  testPushSocket,
  deleteImage,
  changePaymentStatus,
  exportOrderCustomer,
  requestPament,
};
