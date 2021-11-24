/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const { Model } = Sequelize;
const sequelize = require(`${__dirname}/../config/env.js`);

class message_option extends Model {}
message_option.init(
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    content: Sequelize.TEXT,
    value: Sequelize.TEXT,
  },
  {
    sequelize,
    modelName: 'message_option',
    freezeTableName: true,
    timestamps: false,
  }
);
// khóa chính
message_option.associate = (db) => {};

module.exports = () => message_option;
