/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const { Model } = Sequelize;
const sequelize = require(`${__dirname}/../config/env.js`);

class salary extends Model {}
salary.init(
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    sale_id: Sequelize.INTEGER,
    is_payment: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    start_at: Sequelize.DATE,
    end_at: Sequelize.DATE,
    payment_at: Sequelize.DATE,
    payment_by: Sequelize.INTEGER,
    total_price: Sequelize.INTEGER,
    total_profit: Sequelize.INTEGER,
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
    modelName: 'salary',
    freezeTableName: true,
    timestamps: false,
  }
);
// khóa chính
salary.associate = (db) => {
  db.salary.belongsTo(db.user, {
    as: 'sale',
    foreignKey: {
      name: 'sale_id',
    },
    constraints: false,
  });

  db.salary.belongsTo(db.user, {
    as: 'payment',
    foreignKey: {
      name: 'payment_by',
    },
    constraints: false,
  });

  db.salary.hasMany(db.salary_order, {
    foreignKey: {
      name: 'salary_id',
    },
  });
};

module.exports = () => salary;
