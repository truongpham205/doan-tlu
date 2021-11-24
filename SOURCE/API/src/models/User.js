/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const { Model } = Sequelize;
const sequelize = require(`${__dirname}/../config/env.js`);

class user extends Model { }
user.init(
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    user: {
      type: Sequelize.STRING(50),
      allowNull: false,
    },
    password: {
      type: Sequelize.STRING(100),
      allowNull: false,
    },
    device_id: {
      type: Sequelize.STRING(100),
      allowNull: false,
      defaultValue: '',
    },
    token: {
      type: Sequelize.STRING(100),
      allowNull: false,
      defaultValue: '',
    },
    full_name: Sequelize.STRING(250),
    key_chat: Sequelize.STRING(250),
    email: Sequelize.STRING(250),
    reset_password: Sequelize.STRING(100),
    expired_at: Sequelize.DATE,
    role_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
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
    modelName: 'user',
    freezeTableName: true,
    timestamps: false,
  }
);
// khóa chính
user.associate = (db) => {
  db.user.belongsTo(db.role, {
    foreignKey: {
      name: 'role_id',
    },
  });

  db.user.hasOne(db.customer_info, {
    foreignKey: {
      name: 'customer_id',
    },
  });
  db.user.hasOne(db.provider_info, {
    foreignKey: {
      name: 'provider_id',
    },
  });

  db.user.hasOne(db.sale_info, {
    foreignKey: {
      name: 'sale_id',
    },
  });
  db.user.hasOne(db.user_info, {
    foreignKey: {
      name: 'user_id',
    },
  });

  db.user.hasMany(db.user_history, {
    foreignKey: {
      name: 'user_id',
    },
  });

  db.user.hasMany(db.customer_like_service, {
    foreignKey: {
      name: 'customer_id',
    },
  });

  db.user.hasMany(db.order, {
    as: 'customer',
    foreignKey: {
      name: 'customer_id',
    },
    constraints: false,
  });

  db.user.hasMany(db.order, {
    as: 'sale',
    foreignKey: {
      name: 'sale_id',
    },
    constraints: false,
  });

  db.user.hasMany(db.order, {
    as: 'sale_leader',
    foreignKey: {
      name: 'sale_leader_id',
    },
    constraints: false,
  });

  db.user.hasMany(db.order_review, {
    foreignKey: {
      name: 'customer_id',
    },
    constraints: false,
  });

  db.user.hasMany(db.order_review, {
    foreignKey: {
      name: 'sale_id',
    },
    constraints: false,
  });

  db.user.hasMany(db.service, {
    as: 'provider',
    foreignKey: {
      name: 'provider_id',
    },
    constraints: false,
  });

  db.user.hasMany(db.order_history, {
    foreignKey: {
      name: 'provider_id',
    },
  });

  db.user.hasMany(db.order_provider, {
    foreignKey: {
      name: 'provider_id',
    },
    constraints: false,
  });

  db.user.hasMany(db.salary_provider, {
    foreignKey: {
      name: 'payment_by',
    },
    constraints: false,
  });
  db.user.hasMany(db.salary_provider, {
    foreignKey: {
      name: 'provider_id',
    },
    constraints: false,
  });

  db.user.hasMany(db.salary, {
    foreignKey: {
      name: 'sale_id',
    },
    constraints: false,
  });
  db.user.hasMany(db.salary, {
    foreignKey: {
      name: 'payment_by',
    },
    constraints: false,
  });
};

module.exports = () => user;
