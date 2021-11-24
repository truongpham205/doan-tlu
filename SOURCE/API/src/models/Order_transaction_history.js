/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const { Model } = Sequelize;
const sequelize = require(`${__dirname}/../config/env.js`);

class order_transaction_history extends Model {}
order_transaction_history.init(
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    order_transaction_id: Sequelize.INTEGER,
    status: Sequelize.INTEGER,
    amount: Sequelize.INTEGER,
    price: Sequelize.INTEGER,
    bank: Sequelize.STRING(200),
    transfer_image: Sequelize.STRING(300),
    sms_image: Sequelize.STRING(300),
    sms: Sequelize.TEXT,
    note: Sequelize.TEXT,
    is_epay: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
  },
  {
    sequelize,
    modelName: 'order_transaction_history',
    freezeTableName: true,
    timestamps: false,
  }
);
// khóa chính
order_transaction_history.associate = (db) => {
  db.order_transaction_history.belongsTo(db.order_transaction, {
    foreignKey: {
      name: 'order_transaction_id',
    },
  });
};

module.exports = () => order_transaction_history;
