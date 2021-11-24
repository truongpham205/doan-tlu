const express = require('express');

const router = express.Router();
const newController = require('@controllers/newController');
const middleware = require('@middlewares');
const fileUpload = require('express-fileupload');
const { ROLE } = require('@utils/constant');

router.use(fileUpload());
const response = require('../common/response');

const { wrapHandlerWithJSONResponse } = response;

router
  .get('/newsType', wrapHandlerWithJSONResponse(newController.newsType))
  .get('/newsDetail', wrapHandlerWithJSONResponse(newController.getNewsDetail))
  .get('/listnews', middleware.pagingMiddleware(), wrapHandlerWithJSONResponse(newController.listnews))
  .get('/home', middleware.pagingMiddleware(), wrapHandlerWithJSONResponse(newController.getNewinHome))
  .post(
    '/createOrUpdateNews',
    [middleware.authenticateMiddleware.isAuthenticated(), middleware.authorizeMiddleware([ROLE.ADMIN, ROLE.EDITOR])],
    wrapHandlerWithJSONResponse(newController.createOrUpdateNews)
  )
  .post(
    '/deleteNew',
    [middleware.authenticateMiddleware.isAuthenticated(), middleware.authorizeMiddleware([ROLE.ADMIN, ROLE.EDITOR])],
    wrapHandlerWithJSONResponse(newController.deleteNew)
  );

module.exports = router;
