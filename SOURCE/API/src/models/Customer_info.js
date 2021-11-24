/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const { Model } = Sequelize;
const sequelize = require(`${__dirname}/../config/env.js`);

class Customer_info extends Model {}
Customer_info.init(
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    customer_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    profile_image: Sequelize.STRING(200),
    dob: Sequelize.DATE,
    gender: Sequelize.INTEGER,
    address: Sequelize.STRING(200),
    point: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    facebook_id: Sequelize.STRING(200),
    google_id: Sequelize.STRING(200),
  },
  {
    sequelize,
    modelName: 'customer_info',
    freezeTableName: true,
    timestamps: false,
  }
);
// khóa chính
Customer_info.associate = (db) => {
  db.customer_info.belongsTo(db.user, {
    foreignKey: {
      name: 'customer_id',
    },
  });
};

module.exports = () => Customer_info;
