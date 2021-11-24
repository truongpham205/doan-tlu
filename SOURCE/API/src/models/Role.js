/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const { Model } = Sequelize;
const sequelize = require(`${__dirname}/../config/env.js`);

class role extends Model {}
role.init(
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
    is_show: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    modelName: 'role',
    freezeTableName: true,
    timestamps: false,
  }
);
// khóa chính
role.associate = (db) => {
  db.role.hasMany(db.user, {
    foreignKey: {
      name: 'role_id',
    },
  });
};

module.exports = () => role;
