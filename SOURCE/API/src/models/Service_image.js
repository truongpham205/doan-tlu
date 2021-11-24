/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const { Model } = Sequelize;
const sequelize = require(`${__dirname}/../config/env.js`);

class service_image extends Model {}
service_image.init(
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    path: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    type: Sequelize.INTEGER,
    service_id: Sequelize.INTEGER,
  },
  {
    sequelize,
    modelName: 'service_image',
    freezeTableName: true,
    timestamps: false,
  }
);
// khóa chính
service_image.associate = (db) => {
  db.service_image.belongsTo(db.service, {
    foreignKey: {
      name: 'service_id',
    },
  });
};

module.exports = () => service_image;
