/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const { Model } = Sequelize;
const sequelize = require(`${__dirname}/../config/env.js`);

class user_history extends Model {}
user_history.init(
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    point: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    balance: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    type: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    content: Sequelize.STRING(200),
    description: Sequelize.STRING(500),
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
  },
  {
    sequelize,
    modelName: 'user_history',
    freezeTableName: true,
    timestamps: false,
  }
);

user_history.associate = (db) => {
  db.user_history.belongsTo(db.user, {
    foreignKey: {
      name: 'user_id',
    },
  });
};

module.exports = () => user_history;
