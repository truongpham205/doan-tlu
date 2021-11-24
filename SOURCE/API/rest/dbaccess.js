require('module-alias/register');
const models = require('@models');
const debug = require('debug')('instant');
const { ROLE } = require('@utils/constant');

async function loadUser({ role_id, user_name }) {
  const users = await models.user.findAll({
    where: { ...(role_id && { role_id }), ...(user_name && { user_name }) },
    raw: true,
  });
  console.debug(users);
}

// loadUser({ user_name: '0999888777' });
loadUser({ user_name: '0999123000' });
