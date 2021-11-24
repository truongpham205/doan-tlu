const express = require('express');

const router = express.Router();
const userController = require('@controllers/userController');
const mediaController = require('@controllers/mediaController');
const middleware = require('@middlewares');
const notiController = require('@controllers/notiController');
const fileUpload = require('express-fileupload');
const { ROLE } = require('@utils/constant');

router.use(fileUpload());
const response = require('../common/response');

const { wrapHandlerWithJSONResponse } = response;

router
  .post(
    '/update',
    middleware.authenticateMiddleware.isAuthenticated(),
    wrapHandlerWithJSONResponse(userController.update)
  )
  .post('/createUser', wrapHandlerWithJSONResponse(userController.createUser))
  .get(
    '/userInfo',
    middleware.authenticateMiddleware.isAuthenticated(),
    wrapHandlerWithJSONResponse(userController.getUserInfo)
  )
  .post('/login', wrapHandlerWithJSONResponse(userController.login))
  .post('/test', wrapHandlerWithJSONResponse(mediaController.testOss))
  .post(
    '/uploadImage',
    middleware.authenticateMiddleware.isAuthenticated(),
    wrapHandlerWithJSONResponse(userController.uploadImage)
  )
  .post(
    '/uploadAvatar',
    middleware.authenticateMiddleware.isAuthenticated(),
    wrapHandlerWithJSONResponse(userController.uploadAvatar)
  )
  .post(
    '/logout',
    middleware.authenticateMiddleware.isAuthenticated(),
    wrapHandlerWithJSONResponse(userController.logout)
  )
  .post(
    '/deleteUser',
    [middleware.authenticateMiddleware.isAuthenticated(), middleware.authorizeMiddleware([ROLE.ADMIN])],
    wrapHandlerWithJSONResponse(userController.deleteUser)
  )
  .get(
    '/getRole',
    middleware.authenticateMiddleware.isAuthenticated(),
    wrapHandlerWithJSONResponse(userController.getRole)
  )
  .get(
    '/userDetail',
    middleware.authenticateMiddleware.isAuthenticated(),
    wrapHandlerWithJSONResponse(userController.userDetail)
  )
  .get(
    '/listUser',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.authorizeMiddleware([ROLE.ADMIN]),
      middleware.pagingMiddleware(),
    ],
    wrapHandlerWithJSONResponse(userController.listUser)
  )
  .get(
    '/getPointHistory',
    [middleware.authenticateMiddleware.isAuthenticated(), middleware.pagingMiddleware()],
    wrapHandlerWithJSONResponse(userController.getPointHistory)
  )
  .get(
    '/getlistNoti',
    [middleware.authenticateMiddleware.isAuthenticated(), middleware.pagingMiddleware()],
    wrapHandlerWithJSONResponse(userController.getlistNoti)
  )
  .get(
    '/getConfig',
    [middleware.authenticateMiddleware.isAuthenticated(), middleware.authorizeMiddleware([ROLE.ADMIN])],
    wrapHandlerWithJSONResponse(userController.getConfig)
  )
  .post(
    '/createBank',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.authorizeMiddleware([ROLE.ADMIN, ROLE.SALE_LEADER]),
    ],
    wrapHandlerWithJSONResponse(userController.createBank)
  )
  .post(
    '/updateBank',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.authorizeMiddleware([ROLE.ADMIN, ROLE.SALE_LEADER]),
    ],
    wrapHandlerWithJSONResponse(userController.updateBank)
  )
  .get(
    '/getBanks',
    [middleware.authenticateMiddleware.isAuthenticated()],
    wrapHandlerWithJSONResponse(userController.getBanks)
  )
  .post(
    '/updateIsRead',
    [middleware.authenticateMiddleware.isAuthenticated()],
    wrapHandlerWithJSONResponse(userController.updateIsRead)
  )
  .post(
    '/deleteBanks',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.authorizeMiddleware([ROLE.ADMIN, ROLE.SALE_LEADER]),
    ],
    wrapHandlerWithJSONResponse(userController.deleteBanks)
  )
  .post(
    '/createNoti',
    [middleware.authenticateMiddleware.isAuthenticated()],
    wrapHandlerWithJSONResponse(notiController.createNoti)
  )
  .get(
    '/getStatistic',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.authorizeMiddleware([ROLE.ADMIN, ROLE.SALE_LEADER]),
    ],
    wrapHandlerWithJSONResponse(userController.getStatistic)
  )
  .post(
    '/updateConfig',
    [middleware.authenticateMiddleware.isAuthenticated(), middleware.authorizeMiddleware([ROLE.ADMIN])],
    wrapHandlerWithJSONResponse(userController.updateConfig)
  )
  .post(
    '/referred',
    [middleware.authenticateMiddleware.isAuthenticated(), middleware.authorizeMiddleware([ROLE.CUSTOMER])],
    wrapHandlerWithJSONResponse(userController.referred)
  )
  .post(
    '/changePassword',
    middleware.authenticateMiddleware.isAuthenticated(),
    wrapHandlerWithJSONResponse(userController.changePassword)
  )
  .get(
    '/getListMessageOption',
    [middleware.authenticateMiddleware.isAuthenticated()],
    wrapHandlerWithJSONResponse(userController.getListMessageOption)
  )
  .get(
    '/getListMessage',
    [middleware.authenticateMiddleware.isAuthenticated()],
    wrapHandlerWithJSONResponse(userController.getListMessage)
  )
  .post(
    '/deleteMessage',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.pagingMiddleware(),
      middleware.authorizeMiddleware([ROLE.ADMIN, ROLE.SALE_LEADER]),
    ],
    wrapHandlerWithJSONResponse(userController.deleteMessage)
  )
  .post(
    '/createOrUpdateMessage',
    [
      middleware.authenticateMiddleware.isAuthenticated(),
      middleware.pagingMiddleware(),
      middleware.authorizeMiddleware([ROLE.ADMIN, ROLE.SALE_LEADER]),
    ],
    wrapHandlerWithJSONResponse(userController.createOrUpdateMessage)
  )
  .post('/testNoti', wrapHandlerWithJSONResponse(userController.testNoti));

module.exports = router;
