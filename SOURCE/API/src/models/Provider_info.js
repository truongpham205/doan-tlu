/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const { Model } = Sequelize;
const sequelize = require(`${__dirname}/../config/env.js`);

class provider_info extends Model {}
provider_info.init(
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    provider_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    province_id: Sequelize.INTEGER,
    district_id: Sequelize.INTEGER,
    provider_type_id: Sequelize.INTEGER,
    provider_name: Sequelize.STRING(200),
    profile_image: Sequelize.STRING(200),
    address: Sequelize.STRING(300),
    account: Sequelize.STRING(200),
    bank: Sequelize.STRING(200),
    owner: Sequelize.STRING(200),
    parent_id: Sequelize.INTEGER,
  },
  {
    sequelize,
    modelName: 'provider_info',
    freezeTableName: true,
    timestamps: false,
  }
);
// khóa chính
provider_info.associate = (db) => {
  db.provider_info.belongsTo(db.user, {
    foreignKey: {
      name: 'provider_id',
    },
  });

  db.provider_info.belongsTo(db.province, {
    foreignKey: {
      name: 'province_id',
    },
  });
  db.provider_info.belongsTo(db.district, {
    foreignKey: {
      name: 'district_id',
    },
  });
  db.provider_info.belongsTo(db.provider_type, {
    foreignKey: {
      name: 'provider_type_id',
    },
  });
};

module.exports = () => provider_info;
