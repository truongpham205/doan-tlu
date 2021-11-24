/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const { Model } = Sequelize;
const sequelize = require(`${__dirname}/../config/env.js`);

class note extends Model {}
note.init(
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    note: Sequelize.TEXT,
  },
  {
    sequelize,
    modelName: 'note',
    freezeTableName: true,
    timestamps: false,
  }
);
// khóa chính
note.associate = (db) => {};

module.exports = () => note;
