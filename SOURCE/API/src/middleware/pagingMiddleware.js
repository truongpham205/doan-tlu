const { config } = require('@utils/constant');

const PAGING_LIMIT_MAX = 1000;

module.exports = function () {
  return (req, res, next) => {
    let { page = 1, limit = config.PAGING_LIMIT } = req.query;
    if (limit <= 0 || limit > PAGING_LIMIT_MAX) {
      limit = PAGING_LIMIT_MAX;
    }
    page = Math.max(page, 1);

    const offset = (page - 1) * limit;
    req.query.page = page;
    req.query.limit = +limit;
    req.query.offset = offset;

    next();
  };
};
