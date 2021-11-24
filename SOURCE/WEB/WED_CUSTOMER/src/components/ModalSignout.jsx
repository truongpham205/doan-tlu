import React, { useState } from 'react'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Slide from '@material-ui/core/Slide'
import loginApi from '@networks/loginApi'
import Cookie from 'js-cookie'
import { ROUTER } from '@constants/Constant'

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />
})

export default function ModalSignout(props) {
  const { openModalSingout, handleCloseModalSingout, handleOpenModalSingout } = props
  const [isLoading, setLoading] = useState(false)

  const logout = async () => {
    setLoading(true)
    try {
      await loginApi.logout()
      setLoading(false)
    } catch (err) {
      setLoading(false)
      // alert('Tài khoản đã bị đăng nhập tại nơi khác, làm mới trang để đăng nhập lại')
      Cookie.remove('SESSION_ID')
      window.location.href = ROUTER.HOME_PAGE
    }
    Cookie.remove('SESSION_ID')
    window.location.href = ROUTER.HOME_PAGE
  }

  return (
    <div>
      <Dialog
        open={openModalSingout}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleCloseModalSingout}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle id="alert-dialog-slide-title">Bạn có muốn đăng xuất?</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            Xác nhận đăng xuất khỏi tài khoản hiện tại
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModalSingout} style={{ color: 'red' }}>
            Đóng
          </Button>
          <Button onClick={logout} style={{ color: '#0abe35' }}>
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
