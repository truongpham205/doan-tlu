/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const { Model } = Sequelize;
const sequelize = require(`${__dirname}/../config/env.js`);

class df_order_transaction_type extends Model {}
df_order_transaction_type.init(
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'df_order_transaction_type',
    freezeTableName: true,
    timestamps: false,
  }
);
// khóa chính
df_order_transaction_type.associate = (db) => {
  db.df_order_transaction_type.hasMany(db.order_transaction, {
    foreignKey: {
      name: 'df_order_transaction_type_id',
    },
  });
};

module.exports = () => df_order_transaction_type;
