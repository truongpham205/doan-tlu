const { IS_ACTIVE, apiCode, config, ROLE } = require('@utils/constant');
const { news, df_news_type } = require('@models/');
const Sequelize = require('sequelize');
const mediaController = require('@controllers/mediaController');
const Joi = require('joi');
const utils = require('@utils/utils');
const sequelize = require('../config/env');

const { Op } = Sequelize;
async function newsType(req, res) {
  return df_news_type.findAll({});
}
async function createOrUpdateNews(req, res) {
  const schema = Joi.object()
    .keys({
      df_news_type_id: Joi.number().required(),
      is_active: Joi.number().required(),
      title: Joi.string().empty('').required(),
      description: Joi.string().empty('').required(),
      display_index: Joi.number().empty(null).required(),
      content: Joi.string().empty('').required(),
    })
    .unknown(true);
  const { df_news_type_id, is_active, title, description, display_index, content, note } = await schema.validateAsync(
    req.body
  );
  const findCate = await df_news_type.findOne({ where: { id: df_news_type_id } });
  if (!findCate) {
    throw apiCode.NOT_FOUND;
  }
  const { id } = req.body;
  if (id) {
    const findNews = news.findOne({ where: { id } });
    if (!findNews) {
      throw apiCode.NOT_FOUND;
    }
  }
  const image = await mediaController.uploadMediaWithName(req, 'image');
  if (id) {
    await news.update(
      { df_news_type_id, is_active, title, description, display_index, content, ...(image && { image }), note },
      { where: { id } }
    );
    return newsDetail(req, id);
  }
  const createNews = await news.create({
    df_news_type_id,
    is_active,
    title,
    description,
    display_index,
    content,
    image,
    note,
  });
  return newsDetail(req, createNews.id);
}

async function getNewsDetail(req, res) {
  const { id } = req.query;
  return newsDetail(req, id);
}
async function newsDetail(req, id) {
  const fullUrl = utils.getUrl(req);
  return news.findOne({
    where: { id },
    attributes: [
      'id',
      'df_news_type_id',
      'is_active',
      'title',
      'description',
      'display_index',
      'content',
      'note',
      [sequelize.literal(`IF(LENGTH(image) > 0,CONCAT ('${fullUrl}', image),image)`), 'image'],
    ],
    include: { model: df_news_type },
  });
}
async function listnews(req, res) {
  const fullUrl = utils.getUrl(req);
  const { search = '', is_active, df_news_type_id, page = 1, limit = config.PAGING_LIMIT, offset = 0 } = req.query;
  const order = [['id', 'desc']];
  const { rows, count } = await news.findAndCountAll({
    where: {
      title: { [Op.substring]: search },
      is_active: is_active || { [Op.ne]: IS_ACTIVE.INACTIVE },
      df_news_type_id: df_news_type_id || { [Op.ne]: null },
    },
    attributes: [
      'id',
      'df_news_type_id',
      'is_active',
      'title',
      'created_at',
      'description',
      'note',
      'display_index',
      [sequelize.literal(`IF(LENGTH(image) > 0,CONCAT ('${fullUrl}', image),image)`), 'image'],
    ],
    include: { model: df_news_type },
    limit,
    offset,
    order,
  });
  return { data: rows, paging: { page, count, limit } };
}
async function getNewinHome(req, res) {
  const { limit = config.PAGING_LIMIT, offset = 0 } = req.query;
  const fullUrl = utils.getUrl(req);
  return df_news_type.findAll({
    include: {
      model: news,
      required: false,
      attributes: [
        'id',
        'title',
        [sequelize.literal(`IF(LENGTH(image) > 0,CONCAT ('${fullUrl}', image),image)`), 'image'],
      ],
      limit,
      offset,
      order: ['display_index', ['id', 'desc']],
    },
  });
}

async function deleteNew(req, res) {
  const { listID } = req.body;
  await sequelize.transaction(async (transaction) => {
    await news.destroy({ where: { id: { [Op.in]: listID } }, transaction });
  });
  return true;
}
module.exports = { newsType, createOrUpdateNews, getNewsDetail, listnews, getNewinHome, deleteNew };
