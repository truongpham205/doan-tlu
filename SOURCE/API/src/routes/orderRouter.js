const express = require('express');

const router = express.Router();
const orderController = require('@controllers/orderController');
const middleware = require('@middlewares');
const fileUpload = require('express-fileupload');
const { ROLE } = require('@utils/constant');

router.use(fileUpload());
const response = require('../common/response');

const { wrapHandlerWithJSONResponse } = response;

router
  .post(
    '/createOrder',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.authorizeMiddleware([ROLE.CUSTOMER, ROLE.ADMIN, ROLE.SALE_LEADER]),
    ],
    wrapHandlerWithJSONResponse(orderController.createOrder)
  )
  .post(
    '/orderCustomer',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.authorizeMiddleware([ROLE.CUSTOMER, ROLE.ADMIN, ROLE.SALE_LEADER]),
    ],
    wrapHandlerWithJSONResponse(orderController.orderCustomer)
  )
  .post(
    '/deleteImage',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.authorizeMiddleware([ROLE.CUSTOMER, ROLE.ADMIN, ROLE.SALE_LEADER]),
    ],
    wrapHandlerWithJSONResponse(orderController.deleteImage)
  )
  .post(
    '/orderCustomerV2',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.authorizeMiddleware([ROLE.CUSTOMER, ROLE.ADMIN, ROLE.SALE_LEADER]),
    ],
    wrapHandlerWithJSONResponse(orderController.orderCustomerV2)
  )
  .post(
    '/deleteOrderCustomer',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.authorizeMiddleware([ROLE.CUSTOMER, ROLE.ADMIN, ROLE.SALE_LEADER]),
    ],
    wrapHandlerWithJSONResponse(orderController.deleteOrderCustomer)
  )
  .get(
    '/listOrder',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.authorizeMiddleware([ROLE.CUSTOMER, ROLE.SALE_LEADER, ROLE.ADMIN]),
      middleware.pagingMiddleware(),
    ],
    wrapHandlerWithJSONResponse(orderController.listOrder)
  )
  .get(
    '/overView',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.authorizeMiddleware([ROLE.CUSTOMER, ROLE.SALE_LEADER, ROLE.ADMIN, ROLE.PROVIDER]),
      middleware.pagingMiddleware(),
    ],
    wrapHandlerWithJSONResponse(orderController.getOverView)
  )
  .get(
    '/transactionType',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.authorizeMiddleware([ROLE.SALE_LEADER, ROLE.ADMIN, ROLE.CUSTOMER]),
      middleware.pagingMiddleware(),
    ],
    wrapHandlerWithJSONResponse(orderController.getListTransactionType)
  )
  .get(
    '/detail',
    [middleware.authenticateMiddleware.isAuthenticated(), middleware.pagingMiddleware()],
    wrapHandlerWithJSONResponse(orderController.getDetail)
  )
  .get('/testPushSocket', wrapHandlerWithJSONResponse(orderController.testPushSocket))
  .get(
    '/orderCode',
    [middleware.authenticateMiddleware.isAuthenticated(), middleware.pagingMiddleware()],
    wrapHandlerWithJSONResponse(orderController.getOrderCode)
  )
  .get(
    '/transactionDetail',
    [middleware.authenticateMiddleware.isAuthenticated(), middleware.pagingMiddleware()],
    wrapHandlerWithJSONResponse(orderController.transactionDetail)
  )
  .post(
    '/asign',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.authorizeMiddleware([ROLE.ADMIN, ROLE.SALE_LEADER]),
    ],
    wrapHandlerWithJSONResponse(orderController.asign)
  )
  .post(
    '/updatePrice',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.authorizeMiddleware([ROLE.ADMIN, ROLE.SALE_LEADER]),
    ],
    wrapHandlerWithJSONResponse(orderController.updatePrice)
  )
  .post(
    '/updateStatus',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.authorizeMiddleware([ROLE.CUSTOMER, ROLE.SALE, ROLE.PROVIDER, ROLE.ADMIN, ROLE.SALE_LEADER]),
    ],
    wrapHandlerWithJSONResponse(orderController.updateStatus)
  )
  .post(
    '/createTransaction',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.authorizeMiddleware([ROLE.ADMIN, ROLE.SALE_LEADER, ROLE.CUSTOMER, ROLE.SALE]),
    ],
    wrapHandlerWithJSONResponse(orderController.createTransaction)
  )
  .post(
    '/updateTransaction',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.authorizeMiddleware([ROLE.ADMIN, ROLE.SALE_LEADER]),
    ],
    wrapHandlerWithJSONResponse(orderController.updateTransaction)
  )
  .post(
    '/changePaymentStatus',
    // [
    //   middleware.authenticateMiddleware.isAuthenticated(),
    //   middleware.authorizeMiddleware([ROLE.ADMIN, ROLE.SALE_LEADER]),
    // ],
    wrapHandlerWithJSONResponse(orderController.changePaymentStatus)
  )
  .post(
    '/review',
    [middleware.authenticateMiddleware.isAuthenticated(), middleware.authorizeMiddleware([ROLE.CUSTOMER])],
    wrapHandlerWithJSONResponse(orderController.review)
  )
  .post(
    '/createOrUpdateSurcharge',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.authorizeMiddleware([ROLE.ADMIN, ROLE.SALE_LEADER]),
    ],
    wrapHandlerWithJSONResponse(orderController.createOrUpdateSurcharge)
  )
  .post(
    '/updatePaymentStatus',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.authorizeMiddleware([ROLE.ADMIN, ROLE.SALE_LEADER]),
    ],
    wrapHandlerWithJSONResponse(orderController.updatePaymentStatus)
  )
  .get(
    '/export',
    // wrapHandlerWithJSONResponse(orderController.exportOrderCustomer),
    orderController.exportOrderCustomer
  )
  .post(
    '/resetpaymentTime',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.authorizeMiddleware([ROLE.ADMIN, ROLE.SALE_LEADER]),
    ],
    wrapHandlerWithJSONResponse(orderController.resetpaymentTime)
  )
  .post(
    '/requestPament',
    [middleware.authenticateMiddleware.isAuthenticated(), middleware.authorizeMiddleware([ROLE.CUSTOMER, ROLE.SALE])],
    wrapHandlerWithJSONResponse(orderController.requestPament)
  );

module.exports = router;
