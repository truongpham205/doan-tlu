/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const { Model } = Sequelize;
const sequelize = require(`${__dirname}/../config/env.js`);

class service_category extends Model {}
service_category.init(
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
    image: Sequelize.STRING,
    icon: Sequelize.STRING,
    is_tour: Sequelize.INTEGER,
    is_active: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
  },
  {
    sequelize,
    modelName: 'service_category',
    freezeTableName: true,
    timestamps: false,
  }
);
// khóa chính
service_category.associate = (db) => {
  db.service_category.hasMany(db.service, {
    foreignKey: {
      name: 'service_category_id',
    },
  });
};

module.exports = () => service_category;
