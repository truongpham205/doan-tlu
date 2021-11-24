const express = require('express');

const router = express.Router();
const saleController = require('@controllers/saleController');
const middleware = require('@middlewares');
const fileUpload = require('express-fileupload');
const { ROLE } = require('@utils/constant');

router.use(fileUpload());
const response = require('../common/response');

const { wrapHandlerWithJSONResponse } = response;

router
  .post('/create', wrapHandlerWithJSONResponse(saleController.create))
  .get(
    '/list',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.authorizeMiddleware([ROLE.ADMIN, ROLE.SALE_LEADER]),
      middleware.pagingMiddleware(),
    ],
    wrapHandlerWithJSONResponse(saleController.getListSale)
  )
  .get(
    '/detail',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.authorizeMiddleware([ROLE.ADMIN, ROLE.SALE_LEADER]),
      middleware.pagingMiddleware(),
    ],
    wrapHandlerWithJSONResponse(saleController.getSaleDetail)
  )
  .get(
    '/saleStatistic',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.authorizeMiddleware([ROLE.ADMIN, ROLE.SALE_LEADER]),
      middleware.pagingMiddleware(),
    ],
    wrapHandlerWithJSONResponse(saleController.saleStatistic)
  )
  .get(
    '/listOrder',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.authorizeMiddleware([ROLE.ADMIN, ROLE.SALE_LEADER, ROLE.SALE]),
      middleware.pagingMiddleware(),
    ],
    wrapHandlerWithJSONResponse(saleController.getListOrder)
  )
  .post(
    '/update',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.authorizeMiddleware([ROLE.ADMIN, ROLE.SALE_LEADER]),
    ],
    wrapHandlerWithJSONResponse(saleController.update)
  )

  .post(
    '/updateSaleInfo',
    [middleware.authenticateMiddleware.isAuthenticated(), middleware.authorizeMiddleware([ROLE.SALE])],
    wrapHandlerWithJSONResponse(saleController.updateSaleInfo)
  )
  .post(
    '/createServiceOfSale',
    [middleware.authorizeMiddleware([ROLE.SALE])],
    wrapHandlerWithJSONResponse(saleController.createServiceOfSale)
  )
  .post(
    '/deleteServiceOfSale',
    [middleware.authorizeMiddleware([ROLE.SALE])],
    wrapHandlerWithJSONResponse(saleController.deleteServiceOfSale)
  )
  .post(
    '/updateServiceOfSale',
    [middleware.authorizeMiddleware([ROLE.SALE])],
    wrapHandlerWithJSONResponse(saleController.updateServiceOfSale)
  )
  .get('/getlist', wrapHandlerWithJSONResponse(saleController.getlist))
  .get('/findTag', wrapHandlerWithJSONResponse(saleController.findTag))
  .get('/getListHistory', wrapHandlerWithJSONResponse(saleController.getListHistory))
  .get(
    '/getListServiceHistory',
    middleware.pagingMiddleware(),
    wrapHandlerWithJSONResponse(saleController.getListServiceHistory)
  )
  .post('/deleteGroup', wrapHandlerWithJSONResponse(saleController.deleteGroup))
  .post('/createServiceHistory', wrapHandlerWithJSONResponse(saleController.createServiceHistory))
  .post('/updateServiceHistory', wrapHandlerWithJSONResponse(saleController.updateServiceHistory))
  .get('/getAllgroup', wrapHandlerWithJSONResponse(saleController.getAllgroup))
  .post('/createMultiServiceHistory', wrapHandlerWithJSONResponse(saleController.createMultiServiceHistory))
  .post('/updateRoom', wrapHandlerWithJSONResponse(saleController.updateRoom))
  .post('/deleteServiceHistoryInGroup', wrapHandlerWithJSONResponse(saleController.deleteServiceHistoryInGroup))
  .post('/deleteServiceHistory', wrapHandlerWithJSONResponse(saleController.deleteServiceHistory))
  .post('/deleteMultiServiceHistory', wrapHandlerWithJSONResponse(saleController.deleteMultiServiceHistory))
  .post('/createOrupdateNote', wrapHandlerWithJSONResponse(saleController.createOrupdateNote))
  .get('/getNote', wrapHandlerWithJSONResponse(saleController.getNote))

  .post(
    '/deleteSale',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.authorizeMiddleware([ROLE.ADMIN, ROLE.SALE_LEADER]),
    ],
    wrapHandlerWithJSONResponse(saleController.deleteSale)
  )
  .post(
    '/updatePayment',
    [middleware.authenticateMiddleware.isAuthenticated(), middleware.authorizeMiddleware([ROLE.ADMIN])],
    wrapHandlerWithJSONResponse(saleController.updatePayment)
  )
  .get(
    '/getListSalary',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.authorizeMiddleware([ROLE.ADMIN]),
      middleware.pagingMiddleware(),
    ],
    wrapHandlerWithJSONResponse(saleController.getListSalary)
  )
  .get(
    '/getsalaryDetail',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.authorizeMiddleware([ROLE.ADMIN]),
      middleware.pagingMiddleware(),
    ],
    wrapHandlerWithJSONResponse(saleController.getsalaryDetail)
  )
  .post(
    '/createSalary',
    [middleware.authenticateMiddleware.isAuthenticated(), middleware.authorizeMiddleware([ROLE.ADMIN])],
    wrapHandlerWithJSONResponse(saleController.createSalary)
  )
  .post(
    '/deleteSalary',
    [middleware.authenticateMiddleware.isAuthenticated(), middleware.authorizeMiddleware([ROLE.ADMIN])],
    wrapHandlerWithJSONResponse(saleController.deleteSalary)
  )
  .get(
    '/getSalaryOfSale',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.pagingMiddleware(),
      middleware.authorizeMiddleware([ROLE.SALE]),
    ],
    wrapHandlerWithJSONResponse(saleController.getSalariesOfSale)
  );

module.exports = router;
