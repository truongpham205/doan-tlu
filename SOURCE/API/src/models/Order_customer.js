/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const { Model } = Sequelize;
const sequelize = require(`${__dirname}/../config/env.js`);

class Order_customer extends Model { }
Order_customer.init(
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    order_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    name: Sequelize.STRING(200),
    identify: Sequelize.STRING(200),
    year: Sequelize.INTEGER,
    old: Sequelize.INTEGER,
    back_id: Sequelize.STRING(200),
    font_id: Sequelize.STRING(200),
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    is_leader: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    type: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    modelName: 'order_customer',
    freezeTableName: true,
    timestamps: false,
  }
);
// khóa chính
Order_customer.associate = (db) => {
  db.order_customer.belongsTo(db.order, {
    foreignKey: {
      name: 'order_id',
    },
  });
};

module.exports = () => Order_customer;
