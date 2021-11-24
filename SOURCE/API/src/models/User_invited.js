/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const { Model } = Sequelize;
const sequelize = require(`${__dirname}/../config/env.js`);

class user_invited extends Model {}
user_invited.init(
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: Sequelize.INTEGER,
    invited_by: Sequelize.INTEGER,
    level: Sequelize.INTEGER,
    reward: Sequelize.INTEGER,
  },
  {
    sequelize,
    modelName: 'user_invited',
    freezeTableName: true,
    timestamps: false,
  }
);
// khóa chính
user_invited.associate = (db) => {};

module.exports = () => user_invited;
