/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const { Model } = Sequelize;
const sequelize = require(`${__dirname}/../config/env.js`);

class Notification extends Model { }
Notification.init(
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    title: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    content: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    meta_data: Sequelize.STRING(500),
    type: Sequelize.INTEGER,
    status: Sequelize.INTEGER,
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    is_read: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'notification',
    freezeTableName: true,
    timestamps: false,
  }
);
// khóa chính
Notification.associate = (db) => {
};

module.exports = () => Notification;
