/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const { Model } = Sequelize;
const sequelize = require(`${__dirname}/../config/env.js`);

class salary_order extends Model {}
salary_order.init(
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
    salary_id: Sequelize.INTEGER,
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
    modelName: 'salary_order',
    freezeTableName: true,
    timestamps: false,
  }
);
// khóa chính
salary_order.associate = (db) => {
  db.salary_order.belongsTo(db.order, {
    foreignKey: {
      name: 'order_id',
    },
  });
  db.salary_order.belongsTo(db.salary, {
    foreignKey: {
      name: 'salary_id',
    },
  });
};

module.exports = () => salary_order;
