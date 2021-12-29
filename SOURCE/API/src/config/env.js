const Sequelize = require('sequelize');
const { debug } = require('@utils/constant');
const { db: DbCFG } = require('./CFG');

require('dotenv').config();

const env = {
  host: process.env.DB_HOST || 'winds.hopto.org',
  user: process.env.DB_USER || 'windsoft',
  password: process.env.DB_PASSWORD || 'Windsoft@0808xgwxx',
  database: process.env.DB_NAME || 'televimer',
  port: process.env.DB_PORT || 3306,
};
console.log(process.env);
const sequelize = new Sequelize(env.database, env.user, env.password, {
  host: env.host,
  port: env.port,
  dialect: 'mysql',
  // logging: process.env.NODE_ENV === 'production' ? false : console.log,
  logging: console.log,
  // logging: (msg) => debug.db(msg),

  query: { raw: false },
  timezone: '+00:00',
  dialectOptions: {
    multipleStatements: true,
  },
  pool: {
    max: 30,
    min: 0,
    acquire: 60000,
    idle: 5000,
  },
  define: {
    hooks: true,
  },
});

module.exports = sequelize;
