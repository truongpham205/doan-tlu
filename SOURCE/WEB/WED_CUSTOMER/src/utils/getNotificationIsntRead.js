export const getNotificationIsntRead = (listNotification) => {
  const listNoti = listNotification?.filter((value) => value.is_read === 0)
  return listNoti
}
