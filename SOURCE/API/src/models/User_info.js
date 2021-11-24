/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const { Model } = Sequelize;
const sequelize = require(`${__dirname}/../config/env.js`);

class user_info extends Model {}
user_info.init(
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    profile_image: Sequelize.STRING(200),
    identify: Sequelize.STRING(200),
    province_id: Sequelize.INTEGER,
    dob: Sequelize.DATE,
    gender: Sequelize.INTEGER,
    address: Sequelize.STRING(200),
  },
  {
    sequelize,
    modelName: 'user_info',
    freezeTableName: true,
    timestamps: false,
  }
);
// khóa chính
user_info.associate = (db) => {
  db.user_info.belongsTo(db.user, {
    foreignKey: {
      name: 'user_id',
    },
  });
  db.user_info.belongsTo(db.province, {
    foreignKey: {
      name: 'province_id',
    },
  });
};

module.exports = () => user_info;
