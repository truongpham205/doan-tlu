/* eslint-disable no-await-in-loop */
const { IS_ACTIVE, ROLE, config, apiCode, NOTI_TYPE } = require('@utils/constant');
const {
  regions,
  province,
  district,
  village,
  user,
  service_category,
  service_image,
  service,
  order,
  provider_info,
  order_provider,
  order_transaction,
} = require('@models/');
const Sequelize = require('sequelize');
const serviceController = require('@controllers/serviceController');
const orderController = require('@controllers/orderController');
const mediaController = require('@controllers/mediaController');
const notiController = require('@controllers/notiController');
const Joi = require('joi');
const utils = require('@utils/utils');

const sequelize = require('../config/env');

const { Op, col } = Sequelize;

async function createOrUpdateTour(req, res) {
  const schema = Joi.object()
    .keys({
      code: Joi.string().required(),
      name: Joi.string().required(),
      address: Joi.string().empty('').required(),
      content: Joi.string().empty('').required(),
      people: Joi.string().empty('').required(),
    })
    .unknown(true);
  const { code, name, address, content, people } = await schema.validateAsync(req.body);
  const {
    contact_name = '',
    contact_phone = '',
    province_id = null,
    district_id = null,
    village_id = null,
    regions_id = null,
    is_active = 1,
    schedule,
    cost = '',
    id,
    remove,
  } = req.body;
  let { provider_id } = req.query;
  const { auth } = req;
  if (auth.role_id == ROLE.PROVIDER) {
    const findProviderInfor = await provider_info.findOne({
      where: { provider_id: auth.id, parent_id: { [Op.ne]: null } },
    });
    provider_id = findProviderInfor ? findProviderInfor.parent_id : auth.id;
  }
  console.log('remove', remove);
  const listremove = remove;
  const findCate = await service_category.findOne({
    where: { is_tour: { [Op.ne]: null }, is_active: IS_ACTIVE.ACTIVE },
  });

  const findServiceCode = await service.findOne({
    where: { code, is_active: { [Op.ne]: IS_ACTIVE.INACTIVE }, id: { [Op.ne]: id } },
  });
  if (findServiceCode) {
    throw apiCode.EMAIL_EXIST.withMessage('code đã tồn tại');
  }
  const listImage = [];
  const imageLength = await mediaController.checkImage(req, 'image');
  if (imageLength == 1) {
    const imageName = await mediaController.uploadMediaWithName(req, 'image');
    if (imageName) {
      listImage.push(imageName);
    }
  } else if (imageLength > 1) {
    const { image } = req.files;
    for (let i = 0; i < image.length; i++) {
      const imageName = await mediaController.uploadMedia(image[i]);
      if (imageName) {
        listImage.push(imageName);
      }
    }
  }
  const uploadVideo = await mediaController.uploadVideo(req, 'video');
  const service_id = await sequelize.transaction(async (transaction) => {
    if (id) {
      const findService = await service.findOne({ where: { id, is_active: { [Op.ne]: IS_ACTIVE.INACTIVE } } });
      if (findService.is_tour) {
        throw apiCode.UPDATE_FAIL.withMessage('Bạn không thể sửa loại phòng này');
      }
      if (!findService) {
        throw apiCode.NOT_FOUND;
      }
      findService.update(
        {
          name,
          address,
          content,
          people,
          contact_name,
          contact_phone,
          ...(schedule && { schedule }),
          ...(province_id && { province_id }),
          ...(district_id && { district_id }),
          ...(village_id && { village_id }),
          ...(provider_id && { provider_id }),
          ...(regions_id && { regions_id }),
          cost,
          is_active,
        },
        { transaction }
      );
      await service_image.destroy({ where: { service_id: id, id: { [Op.in]: listremove } } }, { transaction });
      const listImageInsert = listImage.map((item) => ({
        path: item,
        type: 1,
        service_id: id,
      }));
      if (uploadVideo) {
        listImageInsert.push({ path: uploadVideo, type: 2, service_id: id });
      }
      await service_image.bulkCreate(listImageInsert, { transaction });
      return id;
    }
    const crService = await service.create(
      {
        code,
        name,
        address,
        content,
        service_category_id: findCate.id,
        people,
        contact_name,
        contact_phone,
        ...(schedule && { schedule }),
        ...(province_id && { province_id }),
        ...(district_id && { district_id }),
        ...(village_id && { village_id }),
        ...(provider_id && { provider_id }),
        ...(regions_id && { regions_id }),
        cost,
      },
      { transaction }
    );
    const listImageInsert = listImage.map((item) => ({
      path: item,
      type: 1,
      service_id: crService.id,
    }));
    listImageInsert.push({ path: uploadVideo, type: 2, service_id: crService.id });
    await service_image.bulkCreate(listImageInsert, { transaction });
    return crService.id;
  });
  return serviceController.serviceDetail(req, service_id);
}
async function getListTour(req, res) {
  const {
    search = '',
    is_active,
    service_category_id,
    regions_id,
    province_id,
    district_id,
    village_id,
    customer_id,
    page = 1,
    limit = config.PAGING_LIMIT,
    offset = 0,
  } = req.query;
  const where = {
    name: { [Op.substring]: search },
    is_active: is_active || { [Op.ne]: IS_ACTIVE.INACTIVE },
    ...(service_category_id && { service_category_id }),
    ...(regions_id && { regions_id }),
    ...(province_id && { province_id }),
    ...(district_id && { district_id }),
    ...(village_id && { village_id }),
  };
  if (customer_id) {
    where.status = 1;
  }
  const fullUrl = utils.getUrl(req);
  const rows = await service.findAll({
    where,
    attributes: [
      'id',
      'name',
      'code',
      'contact_name',
      'contact_phone',
      [col('service_category.name'), 'service_category_name'],
      'people',
      'cost',
      'rating',
      'is_active',
      'status',
    ],
    include: [
      { model: service_category, where: { is_tour: 1 }, attributes: [] },
      { model: regions },
      { model: province },
      { model: district },
      { model: village },
      { model: user, as: 'provider', attributes: ['id', 'full_name', ['user', 'phone'], 'email'] },
      {
        model: service_image,
        attributes: ['type', [sequelize.literal(`CONCAT ('${fullUrl}', path)`), 'path']],
      },
    ],
    subQuery: false,
    order: [['id', 'DESC']],
  });
  return { data: rows.slice(offset, offset + limit), paging: { page, count: rows.length, limit } };
}

async function getDetail(req, res) {
  const { order_id } = req.query;
  return orderController.tourDetail(order_id, req);
}
async function addProvider(req, res) {
  const { order_id, provider_id } = req.body;
  const findOrder = await order.findOne({ where: { id: order_id } });
  const findProvinder = await user.findOne({
    where: { id: provider_id, is_active: IS_ACTIVE.ACTIVE, role_id: ROLE.PROVIDER },
  });
  if (!findProvinder) {
    throw apiCode.NOT_FOUND.withMessage('Không tìm thấy nhà cung cấp');
  }
  const findOrderProvider = await order_provider.findOne({ where: { order_id, provider_id } });
  if (findOrderProvider) {
    throw apiCode.NOT_FOUND.withMessage('Nhà cung cấp đã có trong đơn hàng');
  }
  await sequelize.transaction(async (transaction) => {
    const createOrderProvider = await order_provider.create({ order_id, provider_id }, { transaction });
    const dattHistory = [
      { order_id, order_provider_id: createOrderProvider.id, df_order_transaction_type_id: 3 },
      { order_id, order_provider_id: createOrderProvider.id, df_order_transaction_type_id: 4 },
      { order_id, order_provider_id: createOrderProvider.id, df_order_transaction_type_id: 5 },
    ];
    await order_transaction.bulkCreate(dattHistory, { transaction });
  });
  await notiController.createNotification({
    user_id: provider_id,
    metaData: { order_id },
    type: NOTI_TYPE.ASIGNED,
    context: findOrder.code,
  });
  return orderController.tourDetail(order_id, req);
}

async function deleteProvider(req, res) {
  const { order_id, id } = req.body;
  const OrderProvider = await order_provider.findOne({ where: { order_id, id } });
  if (!OrderProvider) {
    throw apiCode.NOT_FOUND;
  }
  await sequelize.transaction(async (transaction) => {
    await order_provider.destroy({ where: { id } }, { transaction });
    await order_transaction.destroy({ where: { order_id, order_provider_id: id } }, { transaction });
  });
  return orderController.tourDetail(order_id, req);
}

async function updateIsPayment(req, res) {
  const { order_id, id } = req.body;
  const OrderProvider = await order_provider.findOne({ where: { order_id, id } });
  if (!OrderProvider) {
    throw apiCode.NOT_FOUND;
  }
  await sequelize.transaction(async (transaction) => {
    await order_provider.update({ is_payment: null }, { where: { id: { [Op.ne]: id }, order_id }, transaction });
    await order_provider.update({ is_payment: 1 }, { where: { id }, transaction });
  });
}
module.exports = { getListTour, createOrUpdateTour, getDetail, addProvider, deleteProvider, updateIsPayment };
