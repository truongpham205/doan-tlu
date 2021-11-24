/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const { Model } = Sequelize;
const sequelize = require(`${__dirname}/../config/env.js`);

class history_service_group extends Model { }
history_service_group.init(
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name: Sequelize.TEXT,
    order: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    note: Sequelize.TEXT,
  },
  {
    sequelize,
    modelName: 'history_service_group',
    freezeTableName: true,
    timestamps: false,
  }
);
// khóa chính
history_service_group.associate = (db) => {
  db.history_service_group.hasMany(db.history_service, {
    foreignKey: {
      name: 'group_id',
    },
  });
};

module.exports = () => history_service_group;
