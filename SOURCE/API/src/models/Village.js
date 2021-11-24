/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const { Model } = Sequelize;
const sequelize = require(`${__dirname}/../config/env.js`);

class village extends Model {}
village.init(
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
    type: Sequelize.STRING(30),
    district_id: Sequelize.INTEGER,
  },
  {
    sequelize,
    modelName: 'village',
    freezeTableName: true,
    timestamps: false,
  }
);
// khóa chính
village.associate = (db) => {
  db.village.hasMany(db.service, {
    foreignKey: {
      name: 'village_id',
    },
  });
};

module.exports = () => village;
