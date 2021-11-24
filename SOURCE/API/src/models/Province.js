/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const { Model } = Sequelize;
const sequelize = require(`${__dirname}/../config/env.js`);

class province extends Model {}
province.init(
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    code: {
      type: Sequelize.STRING(45),
      allowNull: true,
    },
    name: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    regions_id: Sequelize.INTEGER(),
  },
  {
    sequelize,
    modelName: 'province',
    freezeTableName: true,
    timestamps: false,
  }
);
// khóa chính
province.associate = (db) => {
  db.province.hasMany(db.provider_info, {
    foreignKey: {
      name: 'province_id',
    },
  });
  db.province.hasMany(db.sale_info, {
    foreignKey: {
      name: 'province_id',
    },
  });
  db.province.hasMany(db.service, {
    foreignKey: {
      name: 'province_id',
    },
  });
  db.province.hasMany(db.user_info, {
    foreignKey: {
      name: 'province_id',
    },
  });
  db.province.hasMany(db.service_for_sale, {
    foreignKey: {
      name: 'province_id',
    },
  });
};

module.exports = () => province;
