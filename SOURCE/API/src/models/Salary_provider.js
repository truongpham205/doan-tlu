/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const { Model } = Sequelize;
const sequelize = require(`${__dirname}/../config/env.js`);

class salary_provider extends Model { }
salary_provider.init(
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    provider_id: Sequelize.INTEGER,
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
    modelName: 'salary_provider',
    freezeTableName: true,
    timestamps: false,
  }
);
// khóa chính
salary_provider.associate = (db) => {
  db.salary_provider.belongsTo(db.user, {
    as: 'provider',
    foreignKey: {
      name: 'provider_id',
    },
    constraints: false,
  });

  db.salary_provider.belongsTo(db.user, {
    as: 'payment',
    foreignKey: {
      name: 'payment_by',
    },
    constraints: false,
  });

  db.salary_provider.hasMany(db.salary_provider_order, {
    foreignKey: {
      name: 'salary_provider_id',
    },
  });
};

module.exports = () => salary_provider;
