import { Badge } from '@material-ui/core'
import Menu from '@material-ui/core/Menu'
import { withStyles } from '@material-ui/core/styles'
import Avatar from 'antd/lib/avatar/avatar'
import moment from 'moment'
import React from 'react'
import bell from '../assets/bell.png'
import NotificationsIcon from '@material-ui/icons/Notifications'
import { getNotificationIsntRead } from '../utils/getNotificationIsntRead'

const StyledMenu = withStyles({
  paper: {
    border: '1px solid #d3d4d5',
  },
})((props) => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'center',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'center',
    }}
    {...props}
  />
))

export default function CustomizedMenus(props) {
  const [anchorEl, setAnchorEl] = React.useState(null)
  const { listUserNotif, readNoti } = props
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <div>
      <Badge
        badgeContent={getNotificationIsntRead(listUserNotif)?.length || 0}
        color="error"
        className="mr-3"
        style={{ cursor: 'pointer' }}
      >
        {/* <img src={bell} onClick={handleClick} /> */}
        <NotificationsIcon onClick={handleClick} />
      </Badge>
      <StyledMenu
        id="customized-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        style={{ maxHeight: 400 }}
      >
        {listUserNotif?.length > 0 ? (
          listUserNotif?.map((value, key) => (
            <div
              style={
                value.is_read === 1
                  ? {
                      display: 'flex',
                      alignItems: 'center',
                      padding: '5px 5px',
                      borderBottom: '1px solid',
                      color: 'gray',
                    }
                  : { display: 'flex', alignItems: 'center', padding: '5px 5px', borderBottom: '1px solid' }
              }
              key={key}
              className="mt-2"
              onClick={() => {
                readNoti(value)
                handleClose()
              }}
            >
              <div>
                <Avatar src={require('@assets/logo-tab.png')} size={40} style={{ objectFit: 'cover' }} />
              </div>
              <div>
                <div style={{ fontWeight: 500 }}>{value?.title || 'Thông báo'}</div>
                <div>{value?.content || ''}</div>
                <div style={value.is_read === 0 ? { fontSize: '0.7rem', color: '#2979ff' } : { fontSize: '0.7rem' }}>
                  {moment(value?.created_at).format('hh:mm DD/MM/YYYY')}
                </div>
              </div>
              {value.is_read === 0 && (
                <div>
                  <i className="fas fa-circle" style={{ fontSize: '12px', color: '#2979ff', float: 'right' }}></i>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>Không có thông báo</p>
        )}
      </StyledMenu>
    </div>
  )
}
