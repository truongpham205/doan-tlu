const compose = require('composable-middleware');
const Sequelize = require('sequelize');
const { user } = require('@models');
const { apiCode, IS_ACTIVE } = require('../utils/constant');
const response = require('../common/response');
const sequelize = require('../config/env');

const { Op } = Sequelize;
// const userController = require('../controllers/userController')

module.exports = {
  isGuest: function isGuest() {
    return compose().use((req, res, next) => {
      next();
    });
  },
  isAuthenticated: function isAuthenticated() {
    return compose().use(async (req, res, next) => {
      const { token } = req.headers;
      console.log('body', req.body);
      console.log('query', req.query);
      if (token) {
        const findUser = await user.findOne({
          where: { token, is_active: IS_ACTIVE.ACTIVE },
        });
        console.log(findUser);
        if (findUser) {
          req.auth = findUser;
          next();
          return;
        }
        res.json(response.error(apiCode.UNAUTHORIZED));
      } else {
        res.json(response.error(apiCode.INVALID_ACCESS_TOKEN));
      }
    });
  },
};
