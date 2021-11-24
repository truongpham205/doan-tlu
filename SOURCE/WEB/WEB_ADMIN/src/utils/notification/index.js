export const notification = (text) => {
  if (!window.Notification) {
  } else {
    // check if permission is already granted
    if (Notification.permission === 'granted') {
      // show notification here
      var notify = new Notification('Tin nhắn mới từ Oho Tour', {
        body: text,
        icon: require('assets/logo_page.png'),
      })
    } else {
      // request permission from user
      Notification.requestPermission()
        .then(function (p) {
          if (p === 'granted') {
            // show notification here
            var notify = new Notification('Tin nhắn mới từ Oho Tour', {
              body: text,
              icon: require('assets/logo_page.png'),
            })
          } else {
          }
        })
        .catch(function (err) {
          console.error(err)
        })
    }
  }
}
