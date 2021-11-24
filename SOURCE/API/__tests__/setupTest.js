process.env.NODE_ENV = 'test';

var models = require('@models');
const app = require('@root/app');
const supertest = require('supertest');
const request = supertest(app);

describe('testing jest', () => {
  it('Testing to see if Jest works', () => {
    expect(1).toBe(1);
  });
});

var auth = {};
module.exports = {
  auth,
  loginAdmin: async () => {
    let user = await models.user.findOne({ where: { user_name: '0123456789', role_id: 1 } });
    if (!user) {
      await models.user.create({
        id: 1,
        full_name: 'admin',
        user_name: '0123456789',
        phone: '0123456789',
        password: 'e10adc3949ba59abbe56e057f20f883e',
        email: 'admin@gmail.com',
        role_id: 1,
      });
    }

    const response = await request
      .post('/user/login')
      .send({ user_name: '0123456789', password: '123456', role_id: 1, device_id: '' });
    auth.token = response.body.data.token;
    auth.user = response.body.data;
    return auth;
  },

  loginEnterprise: async () => {
    let user = await models.user.findOne({ where: { user_name: '0223456789', role_id: 2 } });
    if (!user) {
      await models.user.create({
        id: 2,
        full_name: 'enterprise',
        user_name: '0223456789',
        phone: '0223456789',
        password: 'e10adc3949ba59abbe56e057f20f883e',
        email: 'enterprise@gmail.com',
        role_id: 2,
      });
    }

    const response = await request
      .post('/user/login')
      .send({ user_name: '0223456789', password: '123456', role_id: 1, device_id: '' });
    auth.token = response.body.data.token;
    auth.user = response.body.data;
    return auth;
  },
};
