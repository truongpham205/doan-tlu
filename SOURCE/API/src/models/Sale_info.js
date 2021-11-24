/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const { Model } = Sequelize;
const sequelize = require(`${__dirname}/../config/env.js`);

class sale_info extends Model {}
sale_info.init(
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    sale_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    profile_image: Sequelize.STRING(200),
    point: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    rating: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 5,
    },
    identify: Sequelize.STRING(200),
    profit: Sequelize.INTEGER,
    province_id: Sequelize.INTEGER,
    dob: Sequelize.DATE,
    gender: Sequelize.INTEGER,
    address: Sequelize.STRING(200),
  },
  {
    sequelize,
    modelName: 'sale_info',
    freezeTableName: true,
    timestamps: false,
  }
);
// khóa chính
sale_info.associate = (db) => {
  db.sale_info.belongsTo(db.user, {
    foreignKey: {
      name: 'sale_id',
    },
  });
  db.sale_info.belongsTo(db.province, {
    foreignKey: {
      name: 'province_id',
    },
  });
};

module.exports = () => sale_info;
