/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const { Model } = Sequelize;
const sequelize = require(`${__dirname}/../config/env.js`);

class order_transaction extends Model {}
order_transaction.init(
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
    order_provider_id: Sequelize.INTEGER,
    df_order_transaction_type_id: {
      type: Sequelize.INTEGER,
    },
    status: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    amount: Sequelize.INTEGER,
    price: Sequelize.INTEGER,
    bank: Sequelize.STRING(200),
    bank_id: Sequelize.INTEGER,
    transfer_image: Sequelize.STRING(300),
    sms_image: Sequelize.STRING(300),
    sms: Sequelize.TEXT,
    note: Sequelize.TEXT,
    is_epay: {
      type: Sequelize.INTEGER,
      allowNull: true,
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
    modelName: 'order_transaction',
    freezeTableName: true,
    timestamps: false,
  }
);
// khóa chính
order_transaction.associate = (db) => {
  db.order_transaction.belongsTo(db.order, {
    foreignKey: {
      name: 'order_id',
    },
  });

  db.order_transaction.belongsTo(db.order_provider, {
    foreignKey: {
      name: 'order_provider_id',
    },
  });

  db.order_transaction.belongsTo(db.df_order_transaction_type, {
    foreignKey: {
      name: 'df_order_transaction_type_id',
    },
  });

  db.order_transaction.hasMany(db.order_transaction_history, {
    foreignKey: {
      name: 'order_transaction_id',
    },
  });
  db.order_transaction.hasMany(db.order_transaction_history, {
    foreignKey: {
      name: 'order_transaction_id',
    },
  });
  db.order_transaction.belongsTo(db.bank, {
    as: 'banks',
    foreignKey: {
      name: 'bank_id',
    },
  });
};

module.exports = () => order_transaction;
