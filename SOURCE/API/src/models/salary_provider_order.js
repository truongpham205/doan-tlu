/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const { Model } = Sequelize;
const sequelize = require(`${__dirname}/../config/env.js`);

class salary_provider_order extends Model { }
salary_provider_order.init(
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
    salary_provider_id: Sequelize.INTEGER,
    is_active: {
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
    modelName: 'salary_provider_order',
    freezeTableName: true,
    timestamps: false,
  }
);
// khóa chính
salary_provider_order.associate = (db) => {
  db.salary_provider_order.belongsTo(db.order, {
    foreignKey: {
      name: 'order_id',
    },
  });
  db.salary_provider_order.belongsTo(db.salary_provider, {
    foreignKey: {
      name: 'salary_provider_id',
    },
  });
};

module.exports = () => salary_provider_order;
