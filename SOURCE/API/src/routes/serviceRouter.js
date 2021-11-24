const express = require('express');

const router = express.Router();
const serviceController = require('@controllers/serviceController');
const middleware = require('@middlewares');
const fileUpload = require('express-fileupload');
const { ROLE } = require('@utils/constant');

router.use(fileUpload());
const response = require('../common/response');

const { wrapHandlerWithJSONResponse } = response;

router
  .post('/createOrUpdateCate', wrapHandlerWithJSONResponse(serviceController.createOrUpdateCate))
  .get('/listCate', [middleware.pagingMiddleware()], wrapHandlerWithJSONResponse(serviceController.getListCate))
  .get('/listService', [middleware.pagingMiddleware()], wrapHandlerWithJSONResponse(serviceController.getlistService))
  .get('/serviceDetail', wrapHandlerWithJSONResponse(serviceController.getServiceDetail))
  .get('/review', [middleware.pagingMiddleware()], wrapHandlerWithJSONResponse(serviceController.getListReview))
  .post('/createOrUpdateService', wrapHandlerWithJSONResponse(serviceController.createOrUpdateService))
  .post('/deleteCate', wrapHandlerWithJSONResponse(serviceController.deleteCate))
  .post('/deleteService', wrapHandlerWithJSONResponse(serviceController.deleteService))
  .post(
    '/likeService',
    [middleware.authenticateMiddleware.isAuthenticated(), middleware.authorizeMiddleware([ROLE.CUSTOMER])],
    wrapHandlerWithJSONResponse(serviceController.likeService)
  )
  .get(
    '/listServiceLiked',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.authorizeMiddleware([ROLE.CUSTOMER], middleware.pagingMiddleware()),
    ],
    wrapHandlerWithJSONResponse(serviceController.listServiceLike)
  );

module.exports = router;
