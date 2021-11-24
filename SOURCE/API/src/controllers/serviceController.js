/* eslint-disable no-await-in-loop */
const { apiCode, IS_ACTIVE, config, ROLE } = require('@utils/constant');
const {
  service_category,
  service,
  service_image,
  regions,
  province,
  district,
  provider_info,
  village,
  user,
  customer_like_service,
  order,
  customer_info,
  order_review,
} = require('@models/');
const Sequelize = require('sequelize');
const mediaController = require('@controllers/mediaController');
const Joi = require('joi');
const utils = require('@utils/utils');

const sequelize = require('../config/env');

const { Op, col, QueryTypes } = Sequelize;

async function createOrUpdateCate(req, res) {
  const { name, id = 0, is_active = 1 } = req.body;
  const image = await mediaController.uploadMediaWithName(req, 'image');
  console.log(image);
  if (id) {
    const findCate = await service_category.findOne({ where: { id, is_active: { [Op.ne]: IS_ACTIVE.INACTIVE } } });
    if (!findCate) {
      throw apiCode.NOT_FOUND;
    }
    if (findCate.image && image) {
      await mediaController.removeMedia(findCate.image);
    }
    findCate.update({ name, ...(image && { image }), is_active });
    return findCate;
  }
  return service_category.create({ name, image });
}
async function getListCate(req, res) {
  const fullUrl = utils.getUrl(req);
  const { search = '', is_active, page = 1, limit = config.PAGING_LIMIT, offset = 0 } = req.query;
  const { rows, count } = await service_category.findAndCountAll({
    attributes: [
      'id',
      'name',
      'is_active',
      'created_at',
      [sequelize.literal(`IF(LENGTH(image) > 0,CONCAT ('${fullUrl}', image),image)`), 'image'],
    ],
    where: {
      name: { [Op.substring]: search },
      is_active: is_active || { [Op.ne]: IS_ACTIVE.INACTIVE },
    },
    limit,
    offset,
    order: [['id', 'DESC']],
  });
  return { data: rows, paging: { page, count, limit } };
}
async function createOrUpdateService(req, res) {
  const schema = Joi.object()
    .keys({
      code: Joi.string().required(),
      name: Joi.string().required(),
      address: Joi.string().empty('').required(),
      content: Joi.string().empty('').required(),
      service_category_id: Joi.number().empty(null).required(),
      people: Joi.string().empty('').required(),
    })
    .unknown(true);
  const { code, name, address, content, service_category_id, people, remove, schedule } = await schema.validateAsync(
    req.body
  );
  console.log('remove', remove);
  const listremove = remove;
  const {
    contact_name = '',
    contact_phone = '',
    province_id = null,
    district_id = null,
    village_id = null,
    regions_id = null,
    is_active = 1,
    cost = '',
    id,
  } = req.body;
  const { auth } = req;
  let { provider_id } = req.query;
  if (auth.role_id == ROLE.PROVIDER) {
    const findProviderInfor = await provider_info.findOne({
      where: { provider_id: auth.id, parent_id: { [Op.ne]: null } },
    });
    provider_id = findProviderInfor ? findProviderInfor.parent_id : auth.id;
  }
  if (service_category_id) {
    const findCate = await service_category.findOne({
      where: { id: service_category_id, is_active: IS_ACTIVE.ACTIVE },
    });
    if (!findCate) {
      throw apiCode.NOT_FOUND.withMessage('Không tìm thấy loại phòng');
    }
  }
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
          service_category_id,
          people,
          contact_name,
          contact_phone,
          ...(province_id && { province_id }),
          ...(district_id && { district_id }),
          ...(village_id && { village_id }),
          ...(provider_id && { provider_id }),
          ...(regions_id && { regions_id }),
          ...(schedule && { schedule }),
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
        service_category_id,
        people,
        contact_name,
        contact_phone,
        ...(province_id && { province_id }),
        ...(district_id && { district_id }),
        ...(village_id && { village_id }),
        ...(provider_id && { provider_id }),
        ...(regions_id && { regions_id }),
        ...(schedule && { schedule }),
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
  return serviceDetail(req, service_id);
}
async function getlistService(req, res) {
  const {
    search = '',
    is_active,
    service_category_id,
    list_service_category_id,
    regions_id,
    list_regions_id,
    province_id,
    district_id,
    village_id,
    isCustomer,
    page = 1,
    limit = config.PAGING_LIMIT,
    offset = 0,
  } = req.query;
  const listCate = list_service_category_id ? list_service_category_id.split(',') : [];
  const listRegion = list_regions_id ? list_regions_id.split(',') : [];
  if (regions_id) listRegion.push(regions_id);
  if (service_category_id) listCate.push(service_category_id);
  const where = {
    name: { [Op.substring]: search },
    is_active: is_active || { [Op.ne]: IS_ACTIVE.INACTIVE },
    ...(listCate.length >= 1 && { service_category_id: { [Op.in]: listCate } }),
    ...(listRegion.length >= 1 && { regions_id: { [Op.in]: listRegion } }),
    ...(province_id && { province_id }),
    ...(district_id && { district_id }),
    ...(village_id && { village_id }),
  };
  if (isCustomer) {
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
      {
        model: service_category,
        where: { is_tour: isCustomer ? { [Op.or]: [{ [Op.ne]: null }, null] } : { [Op.ne]: 1 } },
        attributes: [],
      },
      { model: regions },
      { model: province },
      { model: district },
      { model: village },
      { model: user, as: 'provider', attributes: ['id', 'full_name', ['user', 'phone'], 'email'] },
      {
        model: service_image,
        attributes: ['id', 'type', [sequelize.literal(`CONCAT ('${fullUrl}', path)`), 'path']],
      },
    ],
    subQuery: false,
    order: [['id', 'DESC']],
  });
  return { data: rows.slice(offset, offset + limit), paging: { page, count: rows.length, limit } };
}
async function getServiceDetail(req, res) {
  const { id } = req.query;
  return serviceDetail(req, id);
}
async function serviceDetail(req, id) {
  const fullUrl = utils.getUrl(req);
  const { token } = req.headers;
  let customer_id = 0;
  if (token) {
    const findCustomer = await user.findOne({ where: { is_active: { [Op.ne]: IS_ACTIVE.INACTIVE }, token } });
    customer_id = findCustomer ? findCustomer.id : 0;
  }
  const data = await service.findOne({
    where: {
      id,
      is_active: { [Op.ne]: IS_ACTIVE.INACTIVE },
    },
    attributes: [
      'id',
      'name',
      'code',
      'contact_name',
      'contact_phone',
      [col('service_category.name'), 'service_category_name'],
      'service_category_id',
      'people',
      'cost',
      'content',
      'schedule',
      'address',
      'rating',
      'is_active',
      'status',
      [
        sequelize.literal(
          `(SELECT IF(count(id) > 0 ,1,0) FROM customer_like_service 
          WHERE service_id = ${id} AND customer_id = ${customer_id})`
        ),
        'is_liked',
      ],
    ],
    include: [
      { model: service_category, attributes: [] },
      { model: regions },
      { model: province },
      { model: district },
      { model: village },
      { model: user, as: 'provider', attributes: ['id', 'full_name', ['user', 'phone'], 'email'] },
      {
        model: service_image,
        attributes: ['id', 'type', [sequelize.literal(`CONCAT ('${fullUrl}', path)`), 'path']],
      },
    ],
    subQuery: false,
  });
  return data;
}

async function getReviewDetail(id) {
  const query = `SELECT
  (SELECT count(id) FROM order_review where service_id = :id AND rating = 1) as '1',
  (SELECT count(id) FROM order_review where service_id = :id AND rating = 2) as '2',
  (SELECT count(id) FROM order_review where service_id = :id AND rating = 3) as '3',
  (SELECT count(id) FROM order_review where service_id = :id AND rating = 4) as '4',
  (SELECT count(id) FROM order_review where service_id = :id AND rating = 5) as '5'
  `;
  const callDurationStatis = await sequelize.query(query, {
    type: QueryTypes.SELECT,
    replacements: {
      id,
    },
  });
  return callDurationStatis;
}
async function getListReview(req, res) {
  const fullUrl = utils.getUrl(req);
  const { id, page = 1, limit = config.PAGING_LIMIT, offset = 0 } = req.query;
  const { rows, count } = await order_review.findAndCountAll({
    attributes: [
      [col('customer.full_name'), 'customer_name'],
      'rating',
      'note',
      'created_at',
      [
        sequelize.literal(
          `IF(LENGTH( \`customer->customer_info\`.profile_image) > 0,
CONCAT ('${fullUrl}', \`customer->customer_info\`.profile_image),
\`customer->customer_info\`.profile_image)`
        ),
        'profile_image',
      ],
    ],
    where: { service_id: id },
    include: {
      model: user,
      as: 'customer',
      attributes: [],
      include: {
        model: customer_info,
        attributes: [],
      },
    },
    order: [['id', 'DESC']],
    subQuery: false,
    limit,
    offset,
  });
  const statistic = await getReviewDetail(id);
  return { data: { statistic, list_review: rows }, paging: { page, count, limit } };
}

async function deleteCate(req, res) {
  const { listID } = req.body;
  const listService = await service
    .findAll({ where: { service_category_id: { [Op.in]: listID } } })
    .map((item) => item.service_category_id);

  if (listService.length > 0) {
    const listCateName = await service_category
      .findAll({ where: { id: { [Op.in]: listService } } })
      .map((item) => item.name);
    let input = '';
    for (let i = 0; i < listCateName.length; i++) {
      input += `${listCateName[i]}${i < listCateName.length - 1 ? ', ' : ''}`;
    }
    if (input.length > 0) {
      throw apiCode.DELETE_FAIL.withMessage(`Nhóm ${input} đã có dịch vụ hoạt động không thể xoá`);
    }
  }
  await service_category.destroy({ where: { id: { [Op.in]: listID } } });
  return true;
}

async function deleteService(req, res) {
  const { listID } = req.body;
  const listServiceID = await order
    .findAll({ where: { service_id: { [Op.in]: listID } } })
    .map((item) => item.service_id);
  if (listServiceID.length > 0) {
    const listServiceName = await service
      .findAll({ where: { id: { [Op.in]: listServiceID } } })
      .map((item) => item.name);
    let input = '';
    for (let i = 0; i < listServiceName.length; i++) {
      input += `${listServiceName[i]}${i < listServiceName.length - 1 ? ', ' : ''}`;
    }
    if (input.length > 0) {
      throw apiCode.DELETE_FAIL.withMessage(`Dịch vụ ${input} đã có đơn hàng không thể xoá`);
    }
  }
  await sequelize.transaction(async (transaction) => {
    await service_image.destroy({ where: { service_id: { [Op.in]: listID } }, transaction });
    await service.destroy({ where: { id: { [Op.in]: listID } }, transaction });
  });
  return true;
}
async function likeService(req, res) {
  const { auth } = req;
  const { service_id } = req.body;
  const findCustomerLike = await customer_like_service.findOne({ where: { service_id, customer_id: auth.id } });
  if (findCustomerLike) {
    await customer_like_service.destroy({ where: { service_id, customer_id: auth.id } });
  } else {
    customer_like_service.create({ service_id, customer_id: auth.id });
  }
  return serviceDetail(req, service_id);
}

async function listServiceLike(req, res) {
  const fullUrl = utils.getUrl(req);
  const { auth } = req;
  const { page = 1, limit = config.PAGING_LIMIT, offset = 0 } = req.query;
  const listID = await customer_like_service.findAll({ where: { customer_id: auth.id } }).map((i) => i.service_id);
  const rows = await service.findAll({
    where: { id: { [Op.in]: listID } },
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
      {
        model: service_category,
        attributes: [],
      },
      { model: regions },
      { model: province },
      { model: district },
      { model: village },
      { model: user, as: 'provider', attributes: ['id', 'full_name', ['user', 'phone'], 'email'] },
      {
        model: service_image,
        attributes: ['id', 'type', [sequelize.literal(`CONCAT ('${fullUrl}', path)`), 'path']],
      },
    ],
    limit,
    offset,
    subQuery: false,
    order: [['id', 'DESC']],
  });
  return { data: rows.slice(offset, offset + limit), paging: { page, count: rows.length, limit } };
}
module.exports = {
  createOrUpdateCate,
  getListCate,
  createOrUpdateService,
  getlistService,
  getServiceDetail,
  getListReview,
  serviceDetail,
  deleteCate,
  deleteService,
  likeService,
  listServiceLike,
};
