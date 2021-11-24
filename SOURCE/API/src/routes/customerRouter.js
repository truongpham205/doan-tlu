const express = require('express');

const router = express.Router();
const customerController = require('@controllers/customerController');
const middleware = require('@middlewares');
const fileUpload = require('express-fileupload');
const { ROLE } = require('@utils/constant');

router.use(fileUpload());
const response = require('../common/response');

const { wrapHandlerWithJSONResponse } = response;

router
  .post('/register', wrapHandlerWithJSONResponse(customerController.register))
  .post('/updateIsActive', wrapHandlerWithJSONResponse(customerController.updateIsActive))
  .post(
    '/deleteCustomer',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.authorizeMiddleware([ROLE.ADMIN, ROLE.SALE_LEADER]),
    ],
    wrapHandlerWithJSONResponse(customerController.deleteCustomer)
  )
  .get(
    '/customerPoint',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.authorizeMiddleware([ROLE.SALE, ROLE.SALE_LEADER]),
    ],
    wrapHandlerWithJSONResponse(customerController.getCustomerPoint)
  )
  .get(
    '/listCustomer',
    [middleware.authenticateMiddleware.isAuthenticated(), middleware.pagingMiddleware()],
    wrapHandlerWithJSONResponse(customerController.getListCustomer)
  )
  .get(
    '/listOrder',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.authorizeMiddleware([ROLE.ADMIN, ROLE.SALE_LEADER, ROLE.CUSTOMER]),
      middleware.pagingMiddleware(),
    ],
    wrapHandlerWithJSONResponse(customerController.getListOrder)
  )
  .get(
    '/detail',
    [middleware.authenticateMiddleware.isAuthenticated(), middleware.pagingMiddleware()],
    wrapHandlerWithJSONResponse(customerController.getdetail)
  )
  .post(
    '/update',
    [middleware.authenticateMiddleware.isAuthenticated(), middleware.authorizeMiddleware([ROLE.CUSTOMER])],
    wrapHandlerWithJSONResponse(customerController.update)
  );

module.exports = router;
