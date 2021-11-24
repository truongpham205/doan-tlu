/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const { Model } = Sequelize;
const sequelize = require(`${__dirname}/../config/env.js`);

class order_surcharge extends Model { }
order_surcharge.init(
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
    price: Sequelize.INTEGER,
    amount: Sequelize.INTEGER,
    note: Sequelize.TEXT,
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
  },
  {
    sequelize,
    modelName: 'order_surcharge',
    freezeTableName: true,
    timestamps: false,
  }
);
// khóa chính
order_surcharge.associate = (db) => {
  db.order_surcharge.belongsTo(db.order, {
    foreignKey: {
      name: 'order_id',
    },
  });
};

module.exports = () => order_surcharge;
