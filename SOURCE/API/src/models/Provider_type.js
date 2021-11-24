/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const { Model } = Sequelize;
const sequelize = require(`${__dirname}/../config/env.js`);

class provider_type extends Model {}
provider_type.init(
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
    is_active: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    is_update: Sequelize.INTEGER,
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
  },
  {
    sequelize,
    modelName: 'provider_type',
    freezeTableName: true,
    timestamps: false,
  }
);
// khóa chính
provider_type.associate = (db) => {
  db.provider_type.hasMany(db.provider_info, {
    foreignKey: {
      name: 'provider_type_id',
    },
  });
};

module.exports = () => provider_type;
