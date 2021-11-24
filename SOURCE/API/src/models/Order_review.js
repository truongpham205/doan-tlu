/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const { Model } = Sequelize;
const sequelize = require(`${__dirname}/../config/env.js`);

class order_review extends Model {}
order_review.init(
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
    service_id: Sequelize.INTEGER,
    customer_id: Sequelize.INTEGER,
    sale_id: Sequelize.INTEGER,
    rating: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    note: Sequelize.TEXT,
    type: Sequelize.INTEGER,
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
  },
  {
    sequelize,
    modelName: 'order_review',
    freezeTableName: true,
    timestamps: false,
  }
);
// khóa chính
order_review.associate = (db) => {
  db.order_review.belongsTo(db.order, {
    foreignKey: {
      name: 'order_id',
    },
  });
  db.order_review.belongsTo(db.user, {
    as: 'customer',
    foreignKey: {
      name: 'customer_id',
    },
  });

  db.order_review.belongsTo(db.user, {
    as: 'sale',
    foreignKey: {
      name: 'sale_id',
    },
  });

  db.order_review.belongsTo(db.service, {
    foreignKey: {
      name: 'service_id',
    },
  });
};

module.exports = () => order_review;
