/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const { Model } = Sequelize;
const sequelize = require(`${__dirname}/../config/env.js`);

class service_for_sale extends Model {}
service_for_sale.init(
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
    code: Sequelize.STRING(200),
    province_id: Sequelize.INTEGER,
    is_weekend: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
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
    content: Sequelize.TEXT,
    note: Sequelize.TEXT,
    note2: Sequelize.TEXT,
    link: Sequelize.TEXT,
    link2: Sequelize.TEXT,
    tag: Sequelize.TEXT,
  },
  {
    sequelize,
    modelName: 'service_for_sale',
    freezeTableName: true,
    timestamps: false,
  }
);
// khóa chính
service_for_sale.associate = (db) => {
  db.service_for_sale.belongsTo(db.province, {
    foreignKey: {
      name: 'province_id',
    },
  });
};

module.exports = () => service_for_sale;
