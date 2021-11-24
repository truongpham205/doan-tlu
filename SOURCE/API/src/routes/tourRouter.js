const express = require('express');

const router = express.Router();
const tourController = require('@controllers/tourController');

const middleware = require('@middlewares');
const fileUpload = require('express-fileupload');
const { ROLE } = require('@utils/constant');

router.use(fileUpload());
const response = require('../common/response');

const { wrapHandlerWithJSONResponse } = response;

router
  .get(
    '/listTour',
    [middleware.authenticateMiddleware.isAuthenticated()],
    wrapHandlerWithJSONResponse(tourController.getListTour)
  )
  .get(
    '/getdetail',
    [middleware.authenticateMiddleware.isAuthenticated()],
    wrapHandlerWithJSONResponse(tourController.getDetail)
  )
  .post(
    '/addProvider',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.authorizeMiddleware([ROLE.ADMIN, ROLE.SALE_LEADER]),
    ],
    wrapHandlerWithJSONResponse(tourController.addProvider)
  )
  .post(
    '/deleteProvider',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.authorizeMiddleware([ROLE.ADMIN, ROLE.SALE_LEADER]),
    ],
    wrapHandlerWithJSONResponse(tourController.deleteProvider)
  )
  .post(
    '/updateIsPayment',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.authorizeMiddleware([ROLE.ADMIN, ROLE.SALE_LEADER]),
    ],
    wrapHandlerWithJSONResponse(tourController.updateIsPayment)
  )
  .post(
    '/createOrUpdateTour',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.authorizeMiddleware([ROLE.ADMIN, ROLE.SALE_LEADER]),
    ],
    wrapHandlerWithJSONResponse(tourController.createOrUpdateTour)
  );
module.exports = router;
