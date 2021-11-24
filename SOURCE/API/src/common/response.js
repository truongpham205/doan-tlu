const _ = require('lodash');
const { config } = require('@utils/constant');
const { debug } = require('@utils/constant');
const sequelize = require('../config/env.js');

function wrapErrorJSON(error, message = null, ex = '') {
  return {
    status: 0,
    code: error.code,
    msg: message || error.message,
    ex: ex || ex,
    data: {},
    error,
  };
}
function wrapSuccessJSON(data, message = 'Thành công', count = null, page = 0) {
  return {
    status: 1,
    code: 1,
    msg: message,
    data,
    paging: count ? { page, totalItemCount: count, limit: config.PAGING_LIMIT } : null,
  };
}
function wrapHandlerWithJSONResponse(handler) {
  return async function (req, res, next) {
    console.log(handler);
    try {
      let result = await handler(req, res);
      if (!_.isObject(result) || !result.data) {
        result = { data: result };
      }
      res.json({
        status: 1,
        code: 1,
        msg: 'Thành công',
        ...result,
      });
    } catch (error) {
      // next(error);
      debug.error(error);
      // res.json(wrapErrorJSON(error));
      next(error);
    }
  };
}

module.exports = {
  error: wrapErrorJSON,
  success: wrapSuccessJSON,
  wrapHandlerWithJSONResponse,
};
