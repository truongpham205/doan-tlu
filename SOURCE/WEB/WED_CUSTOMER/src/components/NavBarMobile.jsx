import { ROUTER } from '@constants/Constant'
import Divider from '@material-ui/core/Divider'
import Drawer from '@material-ui/core/Drawer'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import { makeStyles } from '@material-ui/core/styles'
import AppsIcon from '@material-ui/icons/Apps'
import ExitToAppIcon from '@material-ui/icons/ExitToApp'
import PersonAddIcon from '@material-ui/icons/PersonAdd'
import clsx from 'clsx'
import React from 'react'
import { useHistory } from 'react-router-dom'
import logo from '../assets/logo.png'
import Cookie from 'js-cookie'
import Avatar from 'antd/lib/avatar/avatar'
import DateFnsUtils from '@date-io/date-fns'
import { Button, Container, TextField } from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search'
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers'

const useStyles = makeStyles({
  list: {
    width: 250,
  },
  fullList: {
    width: 'auto',
  },
})

export default function NavBarMobile(props) {
  const { userInfo, handle } = props
  const classes = useStyles()
  const [state, setState] = React.useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  })
  const history = useHistory()
  const isLogin = Cookie.get('SESSION_ID')
  const [selectedDate, setSelectedDate] = React.useState()

  const handleDateChange = (date) => {
    setSelectedDate(date)
  }

  const toggleDrawer = (anchor, open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return
    }
    setState({ ...state, [anchor]: open })
  }

  const list = (anchor) => (
    <div
      className={clsx(classes.list, {
        [classes.fullList]: anchor === 'top' || anchor === 'bottom',
      })}
      role="presentation"
      onClick={toggleDrawer(anchor, false)}
      onKeyDown={toggleDrawer(anchor, false)}
    >
      {!isLogin ? (
        <List>
          <ListItem button onClick={() => history.push(ROUTER.LOGIN)}>
            <ListItemIcon>
              <ExitToAppIcon />
            </ListItemIcon>
            <ListItemText primary="????ng nh???p" />
          </ListItem>

          <ListItem button onClick={() => history.push(ROUTER.REGISTER)}>
            <ListItemIcon>
              <PersonAddIcon />
            </ListItemIcon>
            <ListItemText primary="????ng k??" />
          </ListItem>
        </List>
      ) : (
        <List>
          <ListItem button onClick={() => history.push(ROUTER.USER_INFO)}>
            <ListItemIcon>
              <ExitToAppIcon />
            </ListItemIcon>
            <ListItemText primary="Qu???n l?? h??? s?? c?? nh??n" />
          </ListItem>

          <ListItem button onClick={() => history.push(ROUTER.BOOKING_LIST)}>
            <ListItemIcon>
              <PersonAddIcon />
            </ListItemIcon>
            <ListItemText primary="Danh s??ch ?????t ph??ng" />
          </ListItem>

          <ListItem button onClick={() => history.push(ROUTER.FAVOURITE_LIST)}>
            <ListItemIcon>
              <ExitToAppIcon />
            </ListItemIcon>
            <ListItemText primary="Danh s??ch y??u th??ch" />
          </ListItem>

          <ListItem button onClick={handle}>
            <ListItemIcon>
              {userInfo?.customer_info?.profile_image ? (
                <Avatar src={userInfo?.customer_info?.profile_image} size={36} style={{ objectFit: 'cover' }} />
              ) : (
                <Avatar src={require('@assets/logo-tab.png')} size={36} style={{ objectFit: 'cover' }} />
              )}
            </ListItemIcon>
            <ListItemText style={{ color: 'red' }} primary="????ng xu???t" />
          </ListItem>
        </List>
      )}
      <Divider />
      <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem 0' }}>
        <img src={logo} alt="logo" style={{ width: 180, cursor: 'pointer' }} />
      </div>
    </div>
  )

  const listSearch = (anchor) => (
    <div
      className={clsx(classes.list, {
        [classes.fullList]: anchor === 'top' || anchor === 'bottom',
      })}
      role="presentation"
      // onClick={toggleDrawer(anchor, false)}
      // onKeyDown={toggleDrawer(anchor, false)}
      style={{ padding: '0.5rem' }}
    >
      <div className="mb-2">
        <strong className="m-0">?????a ??i???m du l???ch</strong>
        <TextField placeholder="B???n mu???n ??i ????u" style={{ width: '100%' }} />
      </div>
      <div className="mb-2">
        <strong className="m-0">Ng??y</strong>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardDatePicker
            id="date-picker-dialog"
            format="dd/MM/yyyy"
            value={selectedDate}
            onChange={handleDateChange}
            placeholder="Ch???n th???i gian"
            KeyboardButtonProps={{
              'aria-label': 'change date',
            }}
            style={{ width: '100%' }}
          />
        </MuiPickersUtilsProvider>
      </div>
      <div className="mb-2">
        <strong className="m-0">S??? kh??ch</strong>
        <TextField placeholder="Ch???n s??? ng?????i" type="number" style={{ width: '100%' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem 0' }}>
        <div>
          <Button
            variant="contained"
            style={{ backgroundColor: '#0ABE35', color: '#fff' }}
            startIcon={<SearchIcon />}
            onClick={toggleDrawer(anchor, false)}
          >
            T??m ki???m
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <div>
        {['top'].map((anchor) => (
          <React.Fragment key={anchor}>
            {/* <Button onClick={toggleDrawer(anchor, true)}> */}
            <AppsIcon style={{ fontSize: '36px', color: '#0abe35' }} onClick={toggleDrawer(anchor, true)} />
            {/* </Button> */}
            <Drawer anchor={anchor} open={state[anchor]} onClose={toggleDrawer(anchor, false)}>
              {list(anchor)}
            </Drawer>
          </React.Fragment>
        ))}
      </div>
    </>
  )
}
