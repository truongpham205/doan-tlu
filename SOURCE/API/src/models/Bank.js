/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const { Model } = Sequelize;
const sequelize = require(`${__dirname}/../config/env.js`);

class bank extends Model {}
bank.init(
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name: Sequelize.TEXT,
    seri_number: Sequelize.TEXT,
    account: Sequelize.TEXT,
  },
  {
    sequelize,
    modelName: 'bank',
    freezeTableName: true,
    timestamps: false,
  }
);
// khóa chính
bank.associate = (db) => {
  db.bank.hasMany(db.order_transaction, {
    foreignKey: {
      name: 'bank_id',
    },
  });
};

module.exports = () => bank;
