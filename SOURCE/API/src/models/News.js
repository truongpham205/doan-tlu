/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const { Model } = Sequelize;
const sequelize = require(`${__dirname}/../config/env.js`);

class Role extends Model {}
Role.init(
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    df_news_type_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    title: Sequelize.TEXT,
    content: Sequelize.TEXT,
    note: Sequelize.TEXT,
    image: Sequelize.STRING(200),
    description: Sequelize.TEXT,
    display_index: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
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
    modelName: 'news',
    freezeTableName: true,
    timestamps: false,
  }
);
// khóa chính
Role.associate = (db) => {
  db.news.belongsTo(db.df_news_type, {
    foreignKey: {
      name: 'df_news_type_id',
    },
  });
};

module.exports = () => Role;
