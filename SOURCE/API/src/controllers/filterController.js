const { IS_ACTIVE, ROLE, apiCode } = require('@utils/constant');
const { regions, province, district, village, user, provider_info, provider_type } = require('@models/');
const Sequelize = require('sequelize');
const utils = require('@utils/utils');
const userController = require('@controllers/userController');
const mediaController = require('@controllers/mediaController');
const sequelize = require('../config/env');

const { Op } = Sequelize;

async function getRegions(req, res) {
  const { search = '' } = req.query;
  const fullUrl = utils.getUrl(req);
  return regions.findAll({
    where: { name: { [Op.substring]: search }, is_active: 1 },
    attributes: {
      include: [
        [
          sequelize.literal(
            `IF(LENGTH(regions.url) > 0,
CONCAT ('${fullUrl}', regions.url),
regions.url)`
          ),
          'url',
        ],
      ],
    },
  });
}

async function updateRegions(req, res) {
  const { name, content, id, is_active = 1 } = req.body;
  const url = await mediaController.uploadMediaWithName(req, 'images');
  const findRegions = await regions.findOne({ where: { id } });
  if (!findRegions) {
    throw apiCode.NOT_FOUND;
  }
  await regions.update({ name, content, ...(url && { url }), is_active }, { where: { id } });
}

async function getProvince(req, res) {
  const { search = '', regions_id } = req.query;
  return province.findAll({ where: { name: { [Op.substring]: search }, regions_id: regions_id || { [Op.ne]: null } } });
}

async function getDistrict(req, res) {
  const { search = '', province_id } = req.query;
  return district.findAll({
    where: { name: { [Op.substring]: search }, province_id: province_id || { [Op.ne]: null } },
  });
}

async function getVillage(req, res) {
  const { search = '', district_id } = req.query;
  return village.findAll({
    where: { name: { [Op.substring]: search }, district_id: district_id || { [Op.ne]: null } },
  });
}
async function getSaleLeader(req, res) {
  const { search = '' } = req.query;
  return user.findAll({
    attributes: ['id', 'full_name', 'role_id', ['user', 'phone'], 'email'],
    where: {
      [Op.or]: [{ full_name: { [Op.substring]: search } }, { user: { [Op.substring]: search } }],
      role_id: ROLE.SALE_LEADER,
      is_active: IS_ACTIVE.ACTIVE,
    },
  });
}

async function getProvider(req, res) {
  const { search = '', provider_type_id } = req.query;
  return user.findAll({
    attributes: ['id', 'full_name', 'role_id', ['user', 'phone'], 'email'],
    where: {
      [Op.or]: [{ full_name: { [Op.substring]: search } }, { user: { [Op.substring]: search } }],
      role_id: ROLE.PROVIDER,
      is_active: IS_ACTIVE.ACTIVE,
    },
    include: {
      model: provider_info,
      attributes: [],
      where: { provider_type_id: provider_type_id || { [Op.ne]: null } },
    },
  });
}
module.exports = {
  getRegions,
  getProvince,
  getDistrict,
  getVillage,
  getSaleLeader,
  getProvider,
  updateRegions,
};
