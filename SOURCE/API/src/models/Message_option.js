/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const { Model } = Sequelize;
const sequelize = require(`${__dirname}/../config/env.js`);

class message extends Model {}
message.init(
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    content: Sequelize.TEXT,
  },
  {
    sequelize,
    modelName: 'message',
    freezeTableName: true,
    timestamps: false,
  }
);
// khóa chính
message.associate = (db) => {};

module.exports = () => message;
