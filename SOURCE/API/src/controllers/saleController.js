/* eslint-disable no-await-in-loop */
const { config, ROLE, IS_ACTIVE, apiCode, ORDER_STATUS } = require('@utils/constant');
const {
  user,
  sale_info,
  province,
  order,
  service_for_sale,
  salary_order,
  order_history,
  note: Note,
  tag: tagNote,
  history_service,
  history_service_group,
  salary,
  service,
} = require('@models/');
const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const userController = require('@controllers/userController');
const mediaController = require('@controllers/mediaController');
const orderController = require('@controllers/orderController');
const hat = require('hat');
const utils = require('@utils/utils');
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
      identify: Joi.string().empty(''),
      profit: Joi.number().empty(0).required(),
    })
    .unknown(true);
  const { full_name, email, password, phone, identify, profit } = await schema.validateAsync(req.body);

  const { province_id, address, gender, dob } = req.body;
  const role_id = ROLE.SALE;
  const profile_image = await mediaController.uploadMediaWithName(req, 'image');
  const pass = await bcrypt.hashSync(password, config.CRYPT_SALT);
  await userController.checkCreateUser({ phone, email });
  const findUser = await sequelize.transaction(async (transaction) => {
    const token = hat();
    const key_chat = hat();
    const createSale = await user.create(
      { full_name, email, password: pass, user: phone, role_id, token, key_chat },
      { transaction }
    );
    await sale_info.create(
      {
        sale_id: createSale.id,
        ...(profile_image && { profile_image }),
        address,
        identify,
        gender,
        province_id,
        profit,
        dob,
      },
      { transaction }
    );
    return createSale;
  });
  return userController.getUser(findUser.id, req);
}
async function update(req, res) {
  const schema = Joi.object()
    .keys({
      full_name: Joi.string().required(),
      email: Joi.string().required(),
      address: Joi.string().empty(''),
      identify: Joi.string().empty(''),
      gender: Joi.number().empty(null),
      province_id: Joi.number().empty(null),
      profit: Joi.number().empty(0).required(),
      id: Joi.number().empty(0).required(),
    })
    .unknown(true);
  const { full_name, email, dob, address, gender, identify, province_id, profit, id } = await schema.validateAsync(
    req.body
  );
  await userController.checkCreateUser({ email, id });
  const profile_image = await mediaController.uploadMediaWithName(req, 'image');

  await sequelize.transaction(async (transaction) => {
    const createCustomer = await user.update({ full_name, email }, { where: { id }, transaction });
    await sale_info.update(
      {
        ...(dob && { dob }),
        ...(address && { address }),
        ...(identify && { identify }),
        ...(gender && { gender }),
        ...(province_id && { province_id }),
        ...(profile_image && { profile_image }),
        ...(profit && { profit }),
      },
      { where: { sale_id: id }, transaction }
    );
    return createCustomer;
  });
  return userController.getUser(id, req);
}

async function updateSaleInfo(req, res) {
  const schema = Joi.object()
    .keys({
      full_name: Joi.string().required(),
      email: Joi.string().required(),
    })
    .unknown(true);
  const { full_name, email, address, gender, dob } = await schema.validateAsync(req.body);
  const { auth } = req;
  await userController.checkCreateUser({ email, id: auth.id });
  await sequelize.transaction(async (transaction) => {
    await user.update({ full_name, email }, { where: { id: auth.id }, transaction });
    await sale_info.update(
      {
        ...(address && { address }),
        ...(gender && { gender }),
        ...(dob && { dob }),
      },
      { where: { sale_id: auth.id }, transaction }
    );
  });
  return userController.getUser(auth.id, req);
}

async function getListSale(req, res) {
  const { search = '', page = 1, limit = config.PAGING_LIMIT, offset = 0 } = req.query;
  const { rows, count } = await user.findAndCountAll({
    where: {
      is_active: { [Op.ne]: IS_ACTIVE.INACTIVE },
      [Op.or]: [{ full_name: { [Op.substring]: search } }, { user: { [Op.substring]: search } }],
      role_id: ROLE.SALE,
    },
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
    limit,
    offset,
    order: [['id', 'DESC']],
  });
  return { data: rows, paging: { page, count, limit } };
}

async function getSaleDetail(req, res) {
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
        model: sale_info,
        include: {
          model: province,
        },
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
    ],
  });
  return info;
}
async function getListOrder(req, res) {
  const { auth } = req;
  const {
    sale_id = auth.role_id == ROLE.SALE ? auth.id : null,
    status,
    page = 1,
    limit = config.PAGING_LIMIT,
    offset = 0,
  } = req.query;
  return orderController.list({ sale_id, status, limit, offset, page, req });
}

async function deleteSale(req, res) {
  const { listID } = req.body;
  const listOrderProvider = await order
    .findAll({ where: { sale_id: { [Op.in]: listID } } })
    .map((item) => item.sale_id);
  if (listOrderProvider.length > 0) {
    const listProviderName = await user
      .findAll({ where: { id: { [Op.in]: listOrderProvider } } })
      .map((item) => item.full_name);
    let input = '';
    for (let i = 0; i < listProviderName.length; i++) {
      input += `${listProviderName[i]}${i < listProviderName.length - 1 ? ', ' : ''}`;
    }
    if (input.length > 0) {
      throw apiCode.DELETE_FAIL.withMessage(`Sale ${input} đã có đơn hàng không thể xoá`);
    }
  }
  await sequelize.transaction(async (transaction) => {
    await sale_info.destroy({ where: { sale_id: { [Op.in]: listID } }, transaction });
    await user.destroy({ where: { id: { [Op.in]: listID } }, transaction });
  });
  return true;
}

async function saleStatistic(req, res) {
  let { toDate } = req.query;
  if (toDate) {
    toDate = new Date(Date.parse(toDate) + 86400000).toISOString();
  }
  return getListSalaryCreate(toDate);
}

async function getListSalaryCreate(toDate) {
  const findUser = await user.findAll({
    where: { role_id: ROLE.SALE },
    attributes: [
      'id',
      'full_name',
      [
        sequelize.literal(`(SELECT count(o.id) FROM \`order\` as o
        LEFT JOIN salary_order AS os ON os.order_id = o.id
        JOIN order_history AS oh ON o.id = oh.order_id AND oh.status = 10
        WHERE o.sale_id = user.id AND os.id IS NULL
         AND o.status = ${ORDER_STATUS.FINISHED}
         ${toDate ? `AND oh.created_at <= '${toDate}'` : ''}
        )`),
        'countOrder',
      ],
      [
        sequelize.literal(`(SELECT CAST( SUM(o.price) AS UNSIGNED) FROM \`order\` as o
        LEFT JOIN salary_order AS os ON os.order_id = o.id
        JOIN order_history AS oh ON o.id = oh.order_id AND oh.status = 10
        WHERE o.sale_id = user.id AND os.id IS NULL
         AND o.status = ${ORDER_STATUS.FINISHED}
         ${toDate ? `AND oh.created_at <= '${toDate}'` : ''}
        )`),
        'totalPrice',
      ],
      [
        sequelize.literal(`(SELECT CAST( SUM(o.profit) AS UNSIGNED) FROM \`order\` as o
        LEFT JOIN salary_order AS os ON os.order_id = o.id
        JOIN order_history AS oh ON o.id = oh.order_id AND oh.status = 10
        WHERE o.sale_id = user.id AND os.id IS NULL
         AND o.status = ${ORDER_STATUS.FINISHED}
         ${toDate ? `AND oh.created_at <= '${toDate}'` : ''}
        )`),
        'totalProfit',
      ],
      [
        sequelize.literal(`(SELECT MIN(oh.created_at) FROM \`order\` as o
        LEFT JOIN salary_order AS os ON os.order_id = o.id
        JOIN order_history AS oh ON o.id = oh.order_id AND oh.status = 10
        WHERE o.sale_id = user.id AND os.id IS NULL
         AND o.status = ${ORDER_STATUS.FINISHED}
         ${toDate ? `AND oh.created_at <= '${toDate}'` : ''}
        )`),
        'minDate',
      ],
      [sequelize.literal(`'${toDate}'`), 'maxDate'],
    ],
    subQuery: false,
  });
  return findUser.filter((item) => item.dataValues.countOrder > 0);
}

async function createSalary(req, res) {
  const { toDate } = req.body;
  if (!toDate) {
    throw apiCode.INVALID_PARAM.withMessage('vui lòng chọn ngày kết thúc');
  }
  const newToDate = new Date(Date.parse(toDate) + 86400000).toISOString();
  const listSalary = await getListSalaryCreate(newToDate);
  const listOrder = await order.findAll({
    where: { status: ORDER_STATUS.FINISHED, order_id: sequelize.where(col('salary_orders.id'), null) },
    include: [
      { model: salary_order, required: false, attributes: [] },
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
  await sequelize.transaction(async (transaction) => {
    for (let index = 0; index < listSalary.length; index++) {
      const salaryCreate = await salary.create(
        {
          sale_id: listSalary[index].id,
          start_at: listSalary[index].dataValues.minDate,
          end_at: toDate,
          total_price: listSalary[index].dataValues.totalPrice,
          total_profit: listSalary[index].dataValues.totalProfit || listSalary[index].dataValues.totalPrice * 0.1,
        },
        { transaction }
      );
      const listSalaryOrder = listOrder
        .filter((item) => item.sale_id == listSalary[index].id)
        .map((u) => ({ order_id: u.id, salary_id: salaryCreate.id }));
      await salary_order.bulkCreate(listSalaryOrder, { transaction });
    }
  });
  return 1;
}

async function getListSalary(req, res) {
  const { fromDate, search = '', is_payment, page = 1, limit = config.PAGING_LIMIT, offset = 0, sale_id } = req.query;
  let { toDate } = req.query;
  if (toDate) {
    toDate = new Date(Date.parse(toDate) + 86400000).toISOString();
  }
  const { rows, count } = await salary.findAndCountAll({
    attributes: [
      'id',
      'start_at',
      'end_at',
      [col('sale.full_name'), 'sale_name'],
      [col('payment.full_name'), 'payment_name'],
      'total_price',
      'total_profit',
      'is_payment',
      'sale_id',
      'payment_at',
      [sequelize.literal('(SELECT COUNT(id) FROM salary_order WHERE salary_id = salary.id)'), 'total_order'],
    ],
    where: {
      sale_id: sale_id || { [Op.ne]: null },
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
        as: 'sale',
        required: true,
        where: { full_name: { [Op.substring]: search } },
        attributes: [],
      },
      {
        model: user,
        as: 'payment',
        attributes: [],
      },
    ],
    limit,
    offset,
  });
  const query = `SELECT
  (SELECT CAST(SUM(total_profit)  AS UNSIGNED)  FROM salary WHERE is_payment = 1 
  ${sale_id ? `AND sale_id = ${sale_id}` : ''}) AS payment,
  (SELECT CAST(SUM(total_profit) AS UNSIGNED) FROM salary WHERE is_payment = 0
  ${sale_id ? `AND sale_id = ${sale_id}` : ''}) AS unpay
  `;
  const profit = await sequelize.query(query, { type: QueryTypes.SELECT });
  const { payment, unpay } = profit[0];
  return { data: { payment: payment || 0, unpay: unpay || 0, salaries: rows }, paging: { page, count, limit } };
}
async function createServiceOfSale(req, res) {
  const {
    province_id,
    name,
    is_weekend,
    salling_price,
    import_price,
    import_price2,
    import_price3,
    salling_price2,
    salling_price3,
    interest_price,
    interest_price2,
    interest_price3,
    factor,
    link,
    link2,
    factor2,
    factor3,
    content,
    note,
    note2,
    code,
    tag,
  } = req.body;
  const findTags = await tagNote.findOne({ where: { name: { [Op.substring]: tag } } });
  if (!findTags) {
    await tagNote.create({ name: tag });
  }
  await service_for_sale.create({
    province_id,
    name,
    is_weekend,
    salling_price,
    import_price,
    link,
    link2,
    import_price2,
    import_price3,
    salling_price2,
    salling_price3,
    interest_price,
    interest_price2,
    interest_price3,
    factor,
    factor2,
    factor3,
    content,
    note,
    note2,
    code,
    tag,
  });
  return true;
}
async function deleteServiceOfSale(req, res) {
  const { id } = req.body;
  await service_for_sale.destroy({ where: { id } });
}
async function updateServiceOfSale(req, res) {
  const {
    province_id,
    name,
    is_weekend,
    salling_price,
    import_price,
    import_price2,
    import_price3,
    salling_price2,
    salling_price3,
    factor,
    factor2,
    factor3,
    interest_price,
    interest_price2,
    interest_price3,
    content,
    note,
    note2,
    id,
    link,
    link2,
    code,
    tag,
  } = req.body;
  const findTags = await tagNote.findOne({ where: { name: { [Op.substring]: tag } } });
  if (!findTags) {
    await tagNote.create({ name: tag });
  }
  await service_for_sale.update(
    {
      province_id,
      name,
      is_weekend,
      salling_price,
      import_price,
      import_price2,
      import_price3,
      salling_price2,
      salling_price3,
      interest_price,
      interest_price2,
      interest_price3,
      factor,
      factor2,
      factor3,
      content,
      link,
      link2,
      note,
      note2,
      code,
      tag,
    },
    { where: { id } }
  );
  return true;
}
async function findTag(req, res) {
  const { search = '' } = req.query;
  return tagNote.findAll({ where: { name: { [Op.substring]: search } } });
}
async function createServiceHistory(req, res) {
  const {
    salling_price,
    salling_price2,
    salling_price3,
    import_price,
    import_price2,
    import_price3,
    factor,
    factor2,
    factor3,
    interest_price,
    interest_price2,
    interest_price3,
    room_id,
  } = req.body;
  const historyService = await history_service.create({
    room_id,
    salling_price,
    import_price,
    import_price2,
    import_price3,
    salling_price2,
    salling_price3,
    interest_price,
    interest_price2,
    interest_price3,
    factor,
    factor2,
    factor3,
  });
  return historyService;
}

async function createMultiServiceHistory(req, res) {
  const { note, list, name, order_display } = req.body;
  let { group_id } = req.body;
  if (!group_id) {
    const group = await history_service_group.create({ note, name, order: order_display });
    group_id = group.id;
  }
  const listInput = list.map((item) => ({ ...item, group_id }));
  const listroom = await history_service.findAll({ where: { group_id } }).map((u) => u.room_id);
  const listCreate = listInput.filter((u) => !listroom.includes(u.room_id));
  const historyService = await history_service.bulkCreate(listCreate);
  return historyService;
}
async function getAllgroup(req, res) {
  const { search = '' } = req.query;
  return history_service_group.findAll({ where: { name: { [Op.substring]: search } }, attributes: ['id', 'name'] });
}

async function deleteServiceHistoryInGroup(req, res) {
  const { group_id, id } = req.body;
  await history_service.update({ group_id: null }, { where: { id } });
  const findHistory = await history_service.count({ where: { group_id } });
  if (findHistory == 0) {
    history_service_group.destroy({ where: { id: group_id } });
  }
  return getListHistory(req, res);
}

async function updateServiceHistory(req, res) {
  const {
    salling_price,
    import_price,
    import_price2,
    import_price3,
    salling_price2,
    salling_price3,
    factor,
    factor2,
    note,
    note2,
    link,
    link2,
    context,
    factor3,
    interest_price,
    interest_price2,
    interest_price3,
    id,
  } = req.body;
  await history_service.update(
    {
      salling_price,
      import_price,
      import_price2,
      import_price3,
      salling_price2,
      salling_price3,
      factor,
      factor2,
      factor3,
      interest_price,
      interest_price2,
      interest_price3,
      note,
      note2,
      link,
      context,
      link2,
    },
    { where: { id } }
  );
  return true;
}

async function getListServiceHistory(req, res) {
  const { page = 1, limit = config.PAGING_LIMIT, offset = 0, room_id } = req.query;
  const { rows, count } = await history_service.findAndCountAll({ where: { room_id }, limit, offset });
  return { data: rows, paging: { page, count, limit } };
}
async function deleteServiceHistory(req, res) {
  const { id } = req.body;
  await history_service.destroy({
    where: {
      id,
    },
  });
}

async function deleteMultiServiceHistory(req, res) {
  const { room_id } = req.body;
  await history_service.destroy({
    where: {
      room_id,
    },
  });
}

async function updateRoom(req, res) {
  const { note, room_id, name, order_display } = req.body;
  await history_service_group.update({ note, name, order: order_display }, { where: { id: room_id } });
  return getListHistory(req, res);
}

async function createNote(req, res) {
  const { content } = req.body;
  await Note.create({ note: content });
  return Note.findOne({ Order: ['id'] });
}
async function createOrupdateNote(req, res) {
  const { content } = req.body;
  const findnote = await Note.findOne({ Order: ['id'] });
  if (findnote) {
    await Note.update({ note: content }, { where: { id: { [Op.ne]: null } } });
  } else {
    await Note.create({ note: content });
  }
  return Note.findOne({ Order: ['id'] });
}
async function getNote(req, res) {
  return Note.findOne({ Order: ['id'] });
}

async function getlist(req, res) {
  const { province_id, search = '', page = 1, limit = 1000, offset = 0 } = req.query;
  return service_for_sale.findAll({
    where: {
      province_id: province_id || { [Op.ne]: null },
      [Op.or]: [{ name: { [Op.substring]: search } }, { code: { [Op.substring]: search } }],
    },
    attributes: {
      include: [
        [col('province.name'), 'provinceName'],
        [sequelize.literal('1'), '2_5'],
        [sequelize.literal('1'), '6_7'],
      ],
    },
    include: { model: province, attributes: [] },
    order: ['tag', 'id'],
    limit: parseInt(limit, 10),
    offset: (page ? page - 1 : 0) * limit,
  });
}

async function updatePayment(req, res) {
  const { auth } = req;
  const { id } = req.body;
  const findSalary = await salary.findOne({ where: { id } });
  if (!findSalary) {
    throw apiCode.INVALID_PARAM;
  }
  if (findSalary.is_payment == 1) {
    throw apiCode.UPDATE_FAIL.withMessage('Đã quyết toán cho sale này');
  }
  await findSalary.update({ is_payment: 1, payment_by: auth.id, payment_at: Date.now() });
  return 1;
}
async function deleteSalary(req, res) {
  const { listID } = req.body;
  const countSalaryPayed = await salary.count({ where: { id: { [Op.in]: listID }, is_payment: 1 } });
  if (countSalaryPayed > 0) {
    throw apiCode.UPDATE_FAIL.withMessage('Đã có sale quyết toán thành công không thể xóa');
  }
  await sequelize.transaction(async (transaction) => {
    await salary_order.destroy({ where: { salary_id: { [Op.in]: listID } } });
    await salary.destroy({ where: { id: { [Op.in]: listID } } });
  });
}
async function getsalaryDetail(req, res) {
  const { id, page = 1, limit = config.PAGING_LIMIT, offset = 0 } = req.query;
  const findSalary = await salary.findOne({
    where: { id },
    include: [
      { model: user, as: 'sale', attributes: [] },
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
      [col('sale.full_name'), 'sale_name'],
      [col('payment.full_name'), 'payment_name'],
      'total_price',
      'total_profit',
      'is_payment',
      'payment_at',
      [sequelize.literal('(SELECT COUNT(id) FROM salary_order WHERE salary_id = salary.id)'), 'total_order'],
    ],
  });
  const { rows, count } = await order.findAndCountAll({
    attributes: [
      'id',
      'code',
      [col('service.name'), 'service_name'],
      [col('service.id'), 'service_id'],
      [Sequelize.literal('CAST(profit / price * 100 AS UNSIGNED)'), 'profit_percent'],
      'adult',
      'children',
      'checkin_at',
      'checkout_at',
      'price',
      'profit',
    ],
    include: [
      { model: salary_order, where: { salary_id: id }, attributes: [] },
      { model: service, attributes: [] },
    ],
    subQuery: false,
    limit,
    offset,
  });
  return { data: { detail: findSalary, listOrder: rows }, paging: { page, count, limit } };
}

async function getSalariesOfSale(req, res) {
  const { auth } = req;
  const { is_payment, page = 1, limit = config.PAGING_LIMIT, offset = 0 } = req.query;
  const { rows, count } = await order.findAndCountAll({
    attributes: [
      'id',
      'code',
      [col('service.name'), 'service_name'],
      [col('service.id'), 'service_id'],
      [col('salary_orders.salary.is_payment'), 'is_payment'],
      [col('salary_orders.salary.created_at'), 'created_at'],
      [Sequelize.literal('CAST(profit / price * 100 AS UNSIGNED)'), 'profit_percent'],
      'adult',
      'children',
      'checkin_at',
      'checkout_at',
      'price',
      'profit',
    ],
    include: [
      {
        model: salary_order,
        where: { salary_id: { [Op.ne]: null } },
        attributes: [],
        include: {
          model: salary,
          where: { is_payment: is_payment >= 0 ? is_payment : { [Op.ne]: null } },
          attributes: [],
        },
        required: true,
      },
      { model: service, attributes: [] },
    ],
    where: { sale_id: auth.id },
    subQuery: false,
    limit,
    offset,
  });
  return { data: rows, paging: { page, count, limit } };
}
async function getListHistory(req, res) {
  const { search = '' } = req.query;
  return history_service_group.findAll({
    where: { [Op.or]: [{ name: { [Op.substring]: search } }, { note: { [Op.substring]: search } }] },
    include: {
      model: history_service,
      attributes: {
        include: [
          [Sequelize.literal('(SELECT code from service_for_sale where id = history_services.room_id)'), 'code'],
          [
            Sequelize.literal('(SELECT province_id from service_for_sale where id = history_services.room_id)'),
            'province_id',
          ],
          [Sequelize.literal('(SELECT name from service_for_sale where id = history_services.room_id)'), 'name'],
          [
            Sequelize.literal(
              `(SELECT province.name from service_for_sale
                JOIN province ON province.id = service_for_sale.province_id
                where service_for_sale.id = history_services.room_id)`
            ),
            'province_name',
          ],
          [Sequelize.literal('1'), 'is_weekend'],
          [sequelize.literal('1'), '2_5'],
          [sequelize.literal('1'), '6_7'],
        ],
      },
    },
    order: [
      ['order', 'desc'],
      ['id', 'desc'],
    ],
  });
}

async function deleteGroup(req, res) {
  const { id } = req.body;
  if (!id) {
    return false;
  }
  sequelize.transaction(async (transaction) => {
    await history_service.destroy({ where: { group_id: id } }, { transaction });
    await history_service_group.destroy({ where: { id } }, { transaction });
  });
  return true;
}
module.exports = {
  create,
  update,
  getListSale,
  getSaleDetail,
  getListOrder,
  deleteSale,
  saleStatistic,
  updateSaleInfo,
  createServiceOfSale,
  updateServiceOfSale,
  getlist,
  createMultiServiceHistory,
  createSalary,
  getListSalary,
  updatePayment,
  deleteSalary,
  getsalaryDetail,
  deleteServiceOfSale,
  getSalariesOfSale,
  createNote,
  createOrupdateNote,
  getNote,
  createServiceHistory,
  getListServiceHistory,
  deleteServiceHistory,
  deleteMultiServiceHistory,
  getListHistory,
  deleteGroup,
  updateServiceHistory,
  updateRoom,
  deleteServiceHistoryInGroup,
  findTag,
  getAllgroup,
};
