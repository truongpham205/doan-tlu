import { deleteVehicle } from './Api'

const Url = {
  login: '/user/login',
  logout: 'user/logout',
  createAccount: 'user/createUser',
  updateAccount: 'user/update',
  deleteAccount: '/user/deleteUser',
  getListAccount: '/user/listUser',
  getAccountDetail: '/users/user',
  getListRole: '/user/getRole',
  changePasswordAccount: '/user/changePassword',

  getListSale: '/sale/list',

  getListOverView: '/user/getStatistic',
  getListNotification: '/customer/notifications-web',
  readNotification: '/user/updateIsRead',

  createBank: '/user/createBank',
  updateBank: '/user/updateBank',
  deleteBank: '/user/deleteBanks',
  getListBank: '/user/getBanks',
  createNoti: '/user/createNoti',
}
export default Url
