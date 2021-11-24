/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const { Model } = Sequelize;
const sequelize = require(`${__dirname}/../config/env.js`);

class order_history extends Model {}
order_history.init(
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
    status: Sequelize.INTEGER,
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
  },
  {
    sequelize,
    modelName: 'order_history',
    freezeTableName: true,
    timestamps: false,
  }
);
// khóa chính
order_history.associate = (db) => {
  db.order_history.belongsTo(db.order, {
    foreignKey: {
      name: 'order_id',
    },
  });

  db.order_history.belongsTo(db.order_provider, {
    foreignKey: {
      name: 'order_provider_id',
    },
  });
};

module.exports = () => order_history;
