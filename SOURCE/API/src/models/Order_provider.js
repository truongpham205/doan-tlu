/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const { Model } = Sequelize;
const sequelize = require(`${__dirname}/../config/env.js`);

class order_provider extends Model {}
order_provider.init(
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
    provider_id: Sequelize.INTEGER,
    is_active: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    is_payment: Sequelize.INTEGER,
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
  },
  {
    sequelize,
    modelName: 'order_provider',
    freezeTableName: true,
    timestamps: false,
  }
);
// khóa chính
order_provider.associate = (db) => {
  db.order_provider.belongsTo(db.order, {
    foreignKey: {
      name: 'order_id',
    },
  });
  db.order_provider.hasMany(db.order_transaction, {
    foreignKey: {
      name: 'order_provider_id',
    },
  });
  db.order_provider.belongsTo(db.user, {
    foreignKey: {
      name: 'provider_id',
    },
    constraints: false,
  });
  db.order_provider.hasMany(db.order_history, {
    foreignKey: {
      name: 'order_provider_id',
    },
  });
};

module.exports = () => order_provider;
