/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const { Model } = Sequelize;
const sequelize = require(`${__dirname}/../config/env.js`);

class order extends Model { }
order.init(
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    service_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    customer_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    sale_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    adult: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    children: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    note: Sequelize.TEXT,
    status: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    price: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    checkin_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    checkout_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
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
    payment_status: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    use_point: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    profit: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    start_payment_at: Sequelize.DATE,
    end_payment_at: Sequelize.DATE,
    customer_name: Sequelize.TEXT,
    customer_phone: Sequelize.TEXT,
    customer_address: Sequelize.TEXT,
    code: Sequelize.TEXT,
    sale_leader_id: Sequelize.INTEGER,
    is_request_payment: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    payment_provider_at: Sequelize.DATE,
  },
  {
    sequelize,
    modelName: 'order',
    freezeTableName: true,
    timestamps: false,
  }
);
// khóa chính
order.associate = (db) => {
  db.order.belongsTo(db.service, {
    foreignKey: {
      name: 'service_id',
    },
  });
  db.order.belongsTo(db.user, {
    as: 'customer',
    foreignKey: {
      name: 'customer_id',
    },
  });
  db.order.belongsTo(db.user, {
    as: 'sale',
    foreignKey: {
      name: 'sale_id',
    },
  });
  db.order.belongsTo(db.user, {
    as: 'sale_leader',
    foreignKey: {
      name: 'sale_leader_id',
    },
  });

  db.order.hasMany(db.order_history, {
    foreignKey: {
      name: 'order_id',
    },
  });

  db.order.hasMany(db.order_transaction, {
    foreignKey: {
      name: 'order_id',
    },
  });
  db.order.hasMany(db.order_review, {
    foreignKey: {
      name: 'order_id',
    },
  });

  db.order.hasMany(db.order_customer, {
    foreignKey: {
      name: 'order_id',
    },
  });

  db.order.hasMany(db.order_surcharge, {
    foreignKey: {
      name: 'order_id',
    },
  });

  db.order.hasMany(db.order_provider, {
    foreignKey: {
      name: 'order_id',
    },
  });

  db.order.hasMany(db.salary_order, {
    foreignKey: {
      name: 'order_id',
    },
  });
  db.order.hasMany(db.salary_provider_order, {
    foreignKey: {
      name: 'order_id',
    },
  });
};

module.exports = () => order;
