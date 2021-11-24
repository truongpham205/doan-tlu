/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const { Model } = Sequelize;
const sequelize = require(`${__dirname}/../config/env.js`);

class history_service extends Model { }
history_service.init(
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    note: Sequelize.TEXT,
    salling_price: Sequelize.INTEGER,
    import_price: Sequelize.INTEGER,
    import_price2: Sequelize.INTEGER,
    import_price3: Sequelize.INTEGER,
    salling_price2: Sequelize.INTEGER,
    salling_price3: Sequelize.INTEGER,
    factor: Sequelize.FLOAT,
    factor2: Sequelize.FLOAT,
    factor3: Sequelize.FLOAT,
    interest_price: Sequelize.FLOAT,
    interest_price2: Sequelize.FLOAT,
    interest_price3: Sequelize.FLOAT,
    room_id: Sequelize.INTEGER,
    group_id: Sequelize.INTEGER,
    note2: Sequelize.TEXT,
    link: Sequelize.TEXT,
    link2: Sequelize.TEXT,
    content: Sequelize.TEXT,
  },
  {
    sequelize,
    modelName: 'history_service',
    freezeTableName: true,
    timestamps: false,
  }
);
// khóa chính
history_service.associate = (db) => {
  db.history_service.belongsTo(db.history_service_group, {
    foreignKey: {
      name: 'group_id',
    },
  });
};

module.exports = () => history_service;
