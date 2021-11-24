/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const { Model } = Sequelize;
const sequelize = require(`${__dirname}/../config/env.js`);

class service extends Model {}
service.init(
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    rating: Sequelize.DOUBLE,
    provider_id: Sequelize.INTEGER,
    service_category_id: Sequelize.INTEGER,
    people: Sequelize.STRING(255),
    code: Sequelize.STRING(255),
    cost: Sequelize.TEXT,
    content: Sequelize.TEXT,
    address: Sequelize.STRING(255),
    longitude: Sequelize.DOUBLE,
    latitude: Sequelize.DOUBLE,
    schedule: Sequelize.TEXT,
    contact_name: Sequelize.STRING(200),
    contact_phone: Sequelize.STRING(200),
    province_id: Sequelize.INTEGER,
    district_id: Sequelize.INTEGER,
    village_id: Sequelize.INTEGER,
    regions_id: Sequelize.INTEGER,
    status: {
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
    modelName: 'service',
    freezeTableName: true,
    timestamps: false,
  }
);
// khóa chính
service.associate = (db) => {
  db.service.belongsTo(db.service_category, {
    foreignKey: {
      name: 'service_category_id',
    },
  });
  db.service.hasMany(db.order, {
    foreignKey: {
      name: 'service_id',
    },
  });
  db.service.hasMany(db.service_image, {
    foreignKey: {
      name: 'service_id',
    },
  });

  db.service.hasMany(db.customer_like_service, {
    foreignKey: {
      name: 'service_id',
    },
  });

  db.service.hasMany(db.order_review, {
    foreignKey: {
      name: 'service_id',
    },
  });

  db.service.belongsTo(db.user, {
    as: 'provider',
    constraints: false,
    foreignKey: {
      name: 'provider_id',
    },
  });

  db.service.belongsTo(db.province, {
    foreignKey: {
      name: 'province_id',
    },
  });
  db.service.belongsTo(db.district, {
    foreignKey: {
      name: 'district_id',
    },
  });
  db.service.belongsTo(db.village, {
    foreignKey: {
      name: 'village_id',
    },
  });

  db.service.belongsTo(db.regions, {
    foreignKey: {
      name: 'regions_id',
    },
  });
};

module.exports = () => service;
