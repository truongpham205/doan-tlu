const express = require('express');

const router = express.Router();
const filterController = require('@controllers/filterController');
const fileUpload = require('express-fileupload');
const { ROLE } = require('@utils/constant');

router.use(fileUpload());
const middleware = require('@middlewares');

const response = require('../common/response');

const { wrapHandlerWithJSONResponse } = response;

router
  .get('/regions', wrapHandlerWithJSONResponse(filterController.getRegions))
  .post(
    '/updateRegions',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.authorizeMiddleware([ROLE.ADMIN, ROLE.SALE_LEADER]),
    ],
    wrapHandlerWithJSONResponse(filterController.updateRegions)
  )
  .get('/province', wrapHandlerWithJSONResponse(filterController.getProvince))
  .get('/district', wrapHandlerWithJSONResponse(filterController.getDistrict))
  .get('/village', wrapHandlerWithJSONResponse(filterController.getVillage))
  .get('/provider', wrapHandlerWithJSONResponse(filterController.getProvider))
  .get('/saleLeader', wrapHandlerWithJSONResponse(filterController.getSaleLeader));

module.exports = router;
