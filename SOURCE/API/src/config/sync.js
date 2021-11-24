require('module-alias/register');
const models = require('@models');

console.log(models.sequelize);
models.sequelize
  // thêm mới mà k xóa
  // .sync({ force: true })
  //
  .sync({ force: false, alter: true })
  // xóa hết rồi thêm lại
  // .sync({ force: true })
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    throw new Error(err);
  });
