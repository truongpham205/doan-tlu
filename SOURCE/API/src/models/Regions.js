/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const { Model } = Sequelize;
const sequelize = require(`${__dirname}/../config/env.js`);

class regions extends Model {}
regions.init(
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
    url: Sequelize.STRING(550),
    content: Sequelize.TEXT,
    is_active: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    modelName: 'regions',
    freezeTableName: true,
    timestamps: false,
  }
);
// khóa chính
regions.associate = (db) => {
  db.regions.hasMany(db.service, {
    foreignKey: {
      name: 'regions_id',
    },
  });
};

module.exports = () => regions;
