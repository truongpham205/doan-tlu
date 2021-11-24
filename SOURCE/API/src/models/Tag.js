/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const { Model } = Sequelize;
const sequelize = require(`${__dirname}/../config/env.js`);

class tag extends Model {}
tag.init(
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name: Sequelize.TEXT,
  },
  {
    sequelize,
    modelName: 'tag',
    freezeTableName: true,
    timestamps: false,
  }
);
// khóa chính
tag.associate = (db) => {};

module.exports = () => tag;
