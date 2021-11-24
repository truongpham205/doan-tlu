/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const { Model } = Sequelize;
const sequelize = require(`${__dirname}/../config/env.js`);

class District extends Model {}
District.init(
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    prefix: {
      type: Sequelize.STRING(45),
      allowNull: true,
    },
    province_id: Sequelize.INTEGER,
  },
  {
    sequelize,
    modelName: 'district',
    freezeTableName: true,
    timestamps: false,
  }
);
// khóa chính
District.associate = (db) => {
  db.district.hasMany(db.provider_info, {
    foreignKey: {
      name: 'district_id',
    },
  });

  db.district.hasMany(db.service, {
    foreignKey: {
      name: 'district_id',
    },
  });
};

module.exports = () => District;
