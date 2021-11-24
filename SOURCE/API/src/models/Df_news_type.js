/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const { Model } = Sequelize;
const sequelize = require(`${__dirname}/../config/env.js`);

class Df_news_type extends Model {}
Df_news_type.init(
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
  },
  {
    sequelize,
    modelName: 'df_news_type',
    freezeTableName: true,
    timestamps: false,
  }
);
// khóa chính
Df_news_type.associate = (db) => {
  db.df_news_type.hasMany(db.news, {
    foreignKey: {
      name: 'df_news_type_id',
    },
  });
};

module.exports = () => Df_news_type;
