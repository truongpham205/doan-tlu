const express = require('express');

const router = express.Router();
const providerController = require('@controllers/providerController');
const middleware = require('@middlewares');
const fileUpload = require('express-fileupload');
const { ROLE } = require('@utils/constant');

router.use(fileUpload());
const response = require('../common/response');

const { wrapHandlerWithJSONResponse } = response;

router
  .post(
    '/create',
    [middleware.authenticateMiddleware.isAuthenticated(), middleware.authorizeMiddleware([ROLE.ADMIN, ROLE.PROVIDER])],
    wrapHandlerWithJSONResponse(providerController.create)
  )
  .post(
    '/update',
    [middleware.authenticateMiddleware.isAuthenticated(), middleware.authorizeMiddleware([ROLE.ADMIN, ROLE.PROVIDER])],
    wrapHandlerWithJSONResponse(providerController.update)
  )
  .post(
    '/createOrUpdateProviderCate',
    [middleware.authenticateMiddleware.isAuthenticated(), middleware.authorizeMiddleware([ROLE.ADMIN])],
    wrapHandlerWithJSONResponse(providerController.createOrUpdateProviderType)
  )
  .post(
    '/deleteProviderCate',
    [middleware.authenticateMiddleware.isAuthenticated(), middleware.authorizeMiddleware([ROLE.ADMIN])],
    wrapHandlerWithJSONResponse(providerController.deleteProviderType)
  )
  .post(
    '/deleteProvider',
    [middleware.authenticateMiddleware.isAuthenticated(), middleware.authorizeMiddleware([ROLE.ADMIN])],
    wrapHandlerWithJSONResponse(providerController.deleteProvider)
  )
  .post(
    '/deleteManager',
    [middleware.authenticateMiddleware.isAuthenticated(), middleware.authorizeMiddleware([ROLE.PROVIDER])],
    wrapHandlerWithJSONResponse(providerController.deleteManager)
  )
  .post(
    '/salaryOfProvider',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.authorizeMiddleware([ROLE.ADMIN, ROLE.SALE_LEADER]),
    ],
    wrapHandlerWithJSONResponse(providerController.salaryOfProvider)
  )
  .post(
    '/updatePayment',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.authorizeMiddleware([ROLE.ADMIN, ROLE.SALE_LEADER]),
    ],
    wrapHandlerWithJSONResponse(providerController.updatePayment)
  )
  .post(
    '/deleteSalary',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.authorizeMiddleware([ROLE.ADMIN, ROLE.SALE_LEADER]),
    ],
    wrapHandlerWithJSONResponse(providerController.deleteSalary)
  )
  .get(
    '/getSalariesOfProvider',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.authorizeMiddleware([ROLE.ADMIN, ROLE.SALE_LEADER]),
    ],
    wrapHandlerWithJSONResponse(providerController.getSalariesOfProvider)
  )
  .get(
    '/getListSalary',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.authorizeMiddleware([ROLE.ADMIN, ROLE.SALE_LEADER]),
    ],
    wrapHandlerWithJSONResponse(providerController.getListSalary)
  )
  .get(
    '/getsalaryDetail',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.authorizeMiddleware([ROLE.ADMIN, ROLE.SALE_LEADER]),
    ],
    wrapHandlerWithJSONResponse(providerController.getsalaryDetail)
  )
  .get(
    '/providers',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.authorizeMiddleware([ROLE.ADMIN, ROLE.SALE_LEADER]),
      middleware.pagingMiddleware(),
    ],
    wrapHandlerWithJSONResponse(providerController.getListProvider)
  )
  .get(
    '/getListManagers',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.authorizeMiddleware([ROLE.PROVIDER]),
      middleware.pagingMiddleware(),
    ],
    wrapHandlerWithJSONResponse(providerController.getListManagers)
  )
  .get(
    '/providerTypes',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.authorizeMiddleware([ROLE.ADMIN, ROLE.SALE_LEADER]),
      middleware.pagingMiddleware(),
    ],
    wrapHandlerWithJSONResponse(providerController.getListProviderType)
  )
  .get(
    '/listOrder',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.authorizeMiddleware([ROLE.ADMIN, ROLE.SALE_LEADER, ROLE.PROVIDER]),
      middleware.pagingMiddleware(),
    ],
    wrapHandlerWithJSONResponse(providerController.getListOrder)
  )
  .get(
    '/detail',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.authorizeMiddleware([ROLE.ADMIN, ROLE.SALE_LEADER]),
      middleware.pagingMiddleware(),
    ],
    wrapHandlerWithJSONResponse(providerController.getProviderDetail)
  )
  .post(
    '/updateProviderInfo',
    [middleware.authenticateMiddleware.isAuthenticated(), middleware.authorizeMiddleware([ROLE.PROVIDER])],
    wrapHandlerWithJSONResponse(providerController.updateProviderInfo)
  )
  .get(
    '/providerDetailStatistic',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.authorizeMiddleware([ROLE.ADMIN, ROLE.SALE_LEADER]),
      middleware.pagingMiddleware(),
    ],
    wrapHandlerWithJSONResponse(providerController.providerDetailStatistic)
  )
  .get(
    '/providerStatistic',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.authorizeMiddleware([ROLE.ADMIN, ROLE.SALE_LEADER]),
      middleware.pagingMiddleware(),
    ],
    wrapHandlerWithJSONResponse(providerController.providerStatistic)
  );

module.exports = router;
