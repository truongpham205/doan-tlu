export const notification = (text) => {
  if (!window.Notification) {
    console.log('Browser does not support notifications.')
  } else {
    // check if permission is already granted
    if (Notification.permission === 'granted') {
      // show notification here
      var notify = new Notification('Tin nhắn mới từ Oho Tour', {
        body: text,
        icon: require('../assets/logo-tab.png'),
      })
    } else {
      // request permission from user
      Notification.requestPermission()
        .then(function (p) {
          if (p === 'granted') {
            // show notification here
            var notify = new Notification('Tin nhắn mới từ Oho Tour', {
              body: text,
              icon: require('../assets/logo-tab.png'),
            })
          } else {
            console.log('User blocked notifications.')
          }
        })
        .catch(function (err) {
          console.error(err)
        })
    }
  }
}
