process.env.NODE_ENV = 'test';

const supertest = require('supertest');
const { apiCode } = require('@utils/constant');
const app = require('@root/app');
const request = supertest(app);
var models = require('@models');
const setupTest = require('./setupTest.js');

beforeAll(async () => {
  //   await models.sequelize.sync({ force: false, alter: true });
});

afterAll(async () => {
  //   await models.sequelize.dropAllSchemas({});
});

beforeEach(setupTest.loginAdmin);
afterEach(async () => {
  //   await models.user.destroy({ truncate: true });
});

describe('GET /groupCustomer/list', () => {
  it('admin has no permission', async (done) => {
    const res = await request.get('/groupCustomer/list').set('token', setupTest.auth.token);
    expect(res.status).toBe(200);
    expect(res.body.code).toBe(apiCode.UNAUTHORIZED.code);
    done();
  });
});
