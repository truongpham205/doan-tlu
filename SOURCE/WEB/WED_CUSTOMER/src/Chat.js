import { ACCEPT_TYPE } from '@constants/Constant'
import AppBar from '@material-ui/core/AppBar'
// import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import IconButton from '@material-ui/core/IconButton'
import List from '@material-ui/core/List'
import Slide from '@material-ui/core/Slide'
import { makeStyles } from '@material-ui/core/styles'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import CloseIcon from '@material-ui/icons/Close'
import userApi from '@networks/userApi'
import convertTimestampToDate from '@utils/convertTimestampToDate'
import Fire from '@utils/firebaseConfig'
import { Empty, Image, Popover } from 'antd'
import Cookies from 'js-cookie'
import React, { useEffect, useState } from 'react'
import { Badge, Button } from 'react-bootstrap'
import swal from 'sweetalert'

const useStyles = makeStyles((theme) => ({
  appBar: {
    position: 'fixed',
    top: 0,
    backgroundColor: 'green',
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
    color: '#fff',
  },
}))

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

function Chat() {
  const classes = useStyles()
  const isLogin = Cookies.get('SESSION_ID')
  const [messages, setMessages] = useState([])
  const [valueMsg, setMsg] = useState('')
  const [userInfo, setUserInfo] = useState({})
  const [saleInfo, setSaleInfo] = useState('')
  const [roomAdmin, setRoomAdmin] = useState('')
  const [roomList, setRoomList] = useState([])
  const [threadId, setThreadId] = useState('')
  const [isOpenChatBox, setIsOpenChatBox] = useState(false)
  const [exists, setExists] = useState(true)
  const [noti, setNoti] = useState('')
  const [showIntroChat, setShowIntroChat] = useState(false)
  const [showChatFullScreen, setShowChatFullScreen] = useState(false)

  

  const getUserInfo = async () => {
    try {
      const res = await userApi.userInfo()
      setUserInfo(res.data)
      getListRoomChat(res.data.key_chat)
      // var socket = io(SOCKET_URL, {
      //   transports: ['websocket'],
      // })
      // socket.on('newOder', (value) => {
      //   const user = JSON.parse(localStorage.getItem('user'))
      //   if (value.type != CHAT_STATUS.CUSTOMER_CHAT && value.key_chat == user.key_chat) {
      //     value.type != CHAT_STATUS.SALE_LEADER_CONFIRMED && soundPlay(require('@assets/sound/notification.mp3'))
      //     notifySuccess(value.content)
      //     // notification(value.content)
      //   } else if (value.type == CHAT_STATUS.SALE_LEADER_CONFIRMED && value.user_id == user.id) {
      //     soundPlay(require('@assets/sound/notification.mp3'))
      //     notifySuccess(value.content)
      //   }
      //   setNoti(value)
      // })
    } catch (err) {
      swal('Thất bại', `${err.msg}`, 'error')
    }
  }

  const getListMessages = async (thread_id) => {
    Fire.shared.getConversation(thread_id, (listMsg) => {
      listMsg && setMessages(Object.values(listMsg))
      // listMsg && console.log(Object.values(listMsg))
      var objDiv = document.getElementById('card-body-text')
      if (objDiv) {
        objDiv.scrollTop = objDiv.scrollHeight
      }
      var objDiv1 = document.getElementById('card-body-text-mobile')
      objDiv1 && objDiv1.scrollIntoView()
    })
  }

  const handleOpenChatFullScreen = () => {
    setShowChatFullScreen(true)
  }

  const handleCloseChatFullScreen = () => {
    setShowChatFullScreen(false)
    setMessages('')
    setSaleInfo('')
    setThreadId('')
  }

  const getListRoomChat = async (keychat) => {
    const currentUser = { keyChat: keychat }
    const params = { currentUser }
    await Fire.shared.onThread(params, (value) => {
      const listRoom = value && Object.values(value)
      let listRoomSale = []
      let roomAdmin = []
      if (listRoom) {
        for (var room of listRoom) {
          if (room?.sale_name !== 'Hỗ trợ') {
            listRoomSale.push(room)
          } else {
            roomAdmin.push(room)
          }
        }
        value && setRoomList(listRoomSale.sort(compare))
        value && setRoomAdmin(roomAdmin.sort(compare))
      }
    })
  }

  useEffect(() => {
    getUserInfo()
    const openIntroChat = setTimeout(() => setShowIntroChat(true), 2000)
    const closeIntroChat = setTimeout(() => setShowIntroChat(false), 10000)
  }, [])

  // useEffect(() => {
  //   if (!document.hasFocus()) {
  //     notification('Tin nhắn mới')
  //   }
  // }, [messages])

  const createRoomChat = async (data) => {
    // checkExistThread()
    // if (!exists) {
    const threadID = data?.key_chat + data?.key_chat_admin
    const customerInfo = {
      keyChat: data?.key_chat,
      avatar: data?.customer_info?.profile_image,
      name: data?.full_name,
      phone: data?.phone,
    }
    const saleInfo = {
      keyChat: data?.key_chat_admin,
      avatar: '',
      name: 'Hỗ trợ',
      phone: '',
    }
    const params = { threadID, customerInfo, saleInfo }
    Fire.shared.createThread(params, (value) => console.log(value))
    getListRoomChat(data?.key_chat)
    // }
  }

  const checkExistThread = async (data) => {
    const threadID = data?.key_chat + data?.key_chat_admin
    Fire.shared.checkExistThread(threadID, (value) => setExists(value))
  }

  const sendMessage = async (image) => {
    const messages = {
      _id: Date.now(),
      text: valueMsg,
      createdAt: new Date(),
      image: image || '',
      user: {
        _id: userInfo.key_chat,
        avatar: userInfo.customer_info?.profile_image,
        name: userInfo.full_name,
      },
    }
    Fire.shared.onSendMessage(threadId, messages, (value) => {
      setMsg('')
      getListRoomChat(userInfo.key_chat)
      updateReadSale(value, userInfo.full_name, messages.text)
      checkPushNotify()
      // pushNotiAdmin(userInfo.full_name)
      var objDiv = document.getElementById('card-body-text')
      objDiv.scrollTop = objDiv.scrollHeight

      var objDiv1 = document.getElementById('card-body-text-mobile')
      objDiv1 && objDiv1.scrollIntoView()
    })
  }

  const updateReadSale = async (threadId, name, message) => {
    // const params = { keyChat: saleInfo?.sale_key, threadID: threadId }
    // await Fire.shared.updateFocus(params, (value) =>
    //   Fire.shared.updateReadSale({ threadID: value, name: '', message: '' }, (value) => console.log(value))
    // )
    const params = { threadID: threadId, name, message }
    await Fire.shared.updateReadSale(params, () => console.log('ok'))
  }

  const checkPushNotify = () => {
    var objDiv1 = document.getElementById('card-body-text-mobile')
    objDiv1 && objDiv1.scrollIntoView()
  }

  const getRoomFocus = async (value) => {
    setSaleInfo({
      sale_avatar: value.sale_avatar,
      sale_key: value.sale_key,
      sale_name: value.sale_name,
      sale_phone: value.sale_phone,
    })
    setThreadId(value.thread_id)
    await getListMessages(value.thread_id)
    var objDiv = document.getElementById('card-body-text')
    objDiv.scrollTop = objDiv.scrollHeight

    var objDiv1 = document.getElementById('card-body-text-mobile')
    objDiv1 && objDiv1.scrollIntoView()
  }

  const updateFocus = async (value) => {
    const params = { keyChat: value.customer_key, threadID: value.thread_id }
    await Fire.shared.updateFocus(params, (value) => resetReadCustomer(value))
  }

  const resetReadCustomer = async (threadId) => {
    const params = { threadID: threadId }
    await Fire.shared.resetReadCustomer(params, (value) => console.log(value))
  }

  const handleSendMsgKeyPress = (e) => {
    if (e.charCode === 13) {
      sendMessage('')
    }
  }

  const compare = (a, b) => {
    if (a.time < b.time) {
      return 1
    }
    if (a.time > b.time) {
      return -1
    }
    return 0
  }

  const countUnReadMessage = (listMessage) => {
    let unReadMess = 0
    Array.isArray(listMessage) &&
      listMessage.forEach((message) => {
        unReadMess += message.customer_count_read
      })
    return unReadMess
  }

  const sendMessageImage = async (e) => {
    if (e.target?.files?.length <= 0) {
      return
    }
    if (!ACCEPT_TYPE.IMAGE.includes(e.target.files[0].type)) {
      alert('Định dạng ảnh không được hỗ trợ. Vui lòng chọn ảnh khác.')
      return
    }
    const image = await Fire.shared.uploadImage(e.target.files[0])
    sendMessage(image)
  }

  const fullChatScreen = () => {
    return (
      <Dialog fullScreen open={showChatFullScreen} onClose={handleCloseChatFullScreen} TransitionComponent={Transition}>
        <AppBar className={classes.appBar}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={handleCloseChatFullScreen} aria-label="close">
              <CloseIcon />
            </IconButton>
            {!saleInfo ? (
              <>
                <Typography variant="h6" className={classes.title}>
                  Danh sách phòng chat
                </Typography>
              </>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div>
                    <img
                      src={saleInfo?.sale_avatar || require('@assets/logo-tab.png')}
                      className="rounded-circle user_img"
                      style={{}}
                    />
                  </div>
                  <div className="user_info ">
                    <span style={{ fontSize: 16 }} className="text-card text-white">
                      {saleInfo?.sale_name || 'Béo ẩn danh'}
                    </span>
                    <p className="m-0 text-white">{messages?.length || 0} tin nhắn</p>
                  </div>
                </div>
                <Button
                  autoFocus
                  style={{ backgroundColor: '#558b2f', borderColor: '#558b2f' }}
                  onClick={() => setSaleInfo('')}
                >
                  <ArrowBackIcon />
                </Button>
              </div>
            )}
          </Toolbar>
        </AppBar>
        <List style={{ marginTop: '50px' }}>
          {!saleInfo ? (
            <>
              <div className="clearfix vi-header">
                <h3 className="vi-left-title pull-left">Hệ thống</h3>
              </div>
              <ui className="contacts">
                {roomAdmin?.length > 0 ? (
                  roomAdmin?.map((value) => {
                    return (
                      <li
                        className={value.thread_id === threadId ? 'active' : ''}
                        onClick={() => {
                          getRoomFocus(value)
                          updateFocus(value)
                        }}
                      >
                        <div className="d-flex bd-highlight">
                          <div className="img_cont">
                            <img
                              src={value?.sale_avatar || require('@assets/logo-tab.png')}
                              className="rounded-circle user_img"
                            />
                            {/* <span className="online_icon" /> */}
                          </div>
                          <div className="user_info">
                            <span>{value?.sale_name || 'Béo ẩn danh'}</span>
                            <p
                              style={
                                value.customer_count_read > 0
                                  ? { fontSize: '14px', color: '#1976d2', fontWeight: 700, margin: 0 }
                                  : { fontSize: '14px', margin: 0 }
                              }
                            >
                              {value?.last_message}
                            </p>
                          </div>
                          {value.customer_count_read > 0 && (
                            <div className="user_info">
                              <i className="fas fa-circle" style={{ color: '#1976d2' }}></i>
                            </div>
                          )}
                        </div>
                      </li>
                    )
                  })
                ) : (
                  <div className="chat_admin_button">
                    <Button variant="success" onClick={() => createRoomChat(userInfo)}>
                      Tạo chat hệ thống
                    </Button>
                  </div>
                )}
              </ui>
              <div className="clearfix vi-header">
                <h3 className="vi-left-title pull-left">Sale</h3>
              </div>
              <ui className="contacts">
                {roomList?.length > 0 ? (
                  roomList?.map((value) => {
                    return (
                      <li
                        className={value.thread_id === threadId ? 'active' : ''}
                        onClick={() => {
                          getRoomFocus(value)
                          updateFocus(value)
                        }}
                      >
                        <div className="d-flex bd-highlight">
                          <div className="img_cont">
                            <img
                              src={value?.sale_avatar || require('@assets/logo-tab.png')}
                              className="rounded-circle user_img"
                            />
                            {/* <span className="online_icon" /> */}
                          </div>
                          <div className="user_info">
                            <span>{value?.sale_name || 'Béo ẩn danh'}</span>
                            <p
                              style={
                                value.customer_count_read > 0
                                  ? { fontSize: '14px', color: '#1976d2', fontWeight: 700 }
                                  : { fontSize: '14px' }
                              }
                            >
                              {value?.last_message}
                            </p>
                          </div>
                          {value.customer_count_read > 0 && (
                            <div className="user_info">
                              <i className="fas fa-circle" style={{ color: '#1976d2' }}></i>
                            </div>
                          )}
                        </div>
                      </li>
                    )
                  })
                ) : (
                  <Empty description="Chưa có phòng chat nào" />
                )}
              </ui>
            </>
          ) : (
            <div>
              <div style={{ paddingBottom: '50px', paddingTop: '50px' }}>
                <div className="card-body msg_card_body">
                  {messages?.length > 0 &&
                    messages?.map((value) => {
                      if (value?.user?._id === userInfo.key_chat) {
                        return (
                          <>
                            <div className="d-flex justify-content-end mb-4 msg-el">
                              <div className="time-send-msg-right">{convertTimestampToDate(value?.createdAt)}</div>
                              {value?.text && <div className="msg_cotainer_send text-light">{value?.text}</div>}
                              {value?.image && (
                                <div>
                                  <Image
                                    visible={false}
                                    src={value?.image}
                                    style={{
                                      width: '40%',
                                      float: 'right',
                                      marginRight: '12px',
                                      borderRadius: '8px',
                                      objectFit: 'cover',
                                    }}
                                  ></Image>
                                </div>
                              )}
                              <div className="img_cont_msg">
                                <img
                                  src={userInfo.customer_info?.profile_image || require('@assets/logo-tab.png')}
                                  className="rounded-circle user_img_msg"
                                />
                              </div>
                            </div>
                          </>
                        )
                      } else {
                        return (
                          <div className="d-flex justify-content-start mb-4 msg-el">
                            <div className="time-send-msg-left">{convertTimestampToDate(value?.createdAt)}</div>
                            <div className="img_cont_msg">
                              <img
                                src={saleInfo?.sale_avatar || require('@assets/logo-tab.png')}
                                className="rounded-circle user_img_msg"
                              />
                            </div>

                            {value?.text && <div className="msg_cotainer">{value?.text}</div>}
                            {value?.image && (
                              <div>
                                <Image
                                  visible={false}
                                  src={value?.image}
                                  style={{
                                    width: '40%',
                                    float: 'left',
                                    marginLeft: '12px',
                                    borderRadius: '8px',
                                    objectFit: 'cover',
                                  }}
                                ></Image>
                              </div>
                            )}
                          </div>
                        )
                      }
                    })}
                  <div id="card-body-text-mobile"></div>
                </div>
              </div>
              <div
                className="input-group"
                style={{ position: 'fixed', width: '100%', backgroundColor: '#fff', bottom: 0 }}
              >
                <div className="input-group-append">
                  <span className="input-group-text attach_btn">
                    <label htmlFor="id" className="image-upload-label" style={{ cursor: 'pointer' }}>
                      <i className="fas fa-paperclip" style={{ color: '#0abe35' }} />
                    </label>
                    <input
                      type="file"
                      id="id"
                      accept=".jpg,.jpeg,.png"
                      style={{ display: 'none' }}
                      onChange={(e) => sendMessageImage(e)}
                    />
                  </span>
                </div>
                <textarea
                  name
                  className="form-control type_msg"
                  placeholder="Type your message..."
                  value={valueMsg}
                  onChange={(e) => setMsg(e.target.value)}
                  onKeyPress={(e) => handleSendMsgKeyPress(e)}
                />
                <div className="input-group-append">
                  <span className="input-group-text send_btn" onClick={() => sendMessage('')}>
                    <i className="fas fa-location-arrow" style={{ color: '#0abe35' }} />
                  </span>
                </div>
              </div>
            </div>
          )}
        </List>
      </Dialog>
    )
  }

  return (
    <div className="box-chat">
      {fullChatScreen()}
      <input
        type="checkbox"
        hidden
        className="open-chat-box"
        id="action-chat-box"
        checked={isOpenChatBox}
        onClick={() => {
          if (!isOpenChatBox) {
            Fire.shared.resetFocus({ keyChat: userInfo.key_chat }, (value) => console.log(value))
          }
          setIsOpenChatBox(!isOpenChatBox)
        }}
      />
      <div className="row justify-content-end h-100 box-chat-temp">
        <div className="chat p-0 m-0">
          <div className="card mb-sm-3 mb-md-0 contacts_card">
            <div className="card-body contacts_body">
              <div className="clearfix vi-header">
                <h3 className="vi-left-title pull-left">Hệ thống</h3>
              </div>
              <ui className="contacts">
                {roomAdmin?.length > 0 ? (
                  roomAdmin?.map((value) => {
                    return (
                      <li
                        className={value.thread_id === threadId ? 'active' : ''}
                        onClick={() => {
                          getRoomFocus(value)
                          updateFocus(value)
                        }}
                      >
                        <div className="d-flex bd-highlight">
                          <div className="img_cont">
                            <img
                              src={value?.sale_avatar || require('@assets/logo-tab.png')}
                              className="rounded-circle user_img"
                            />
                            {/* <span className="online_icon" /> */}
                          </div>
                          <div className="user_info">
                            <span>{value?.sale_name || 'Béo ẩn danh'}</span>
                            <p
                              style={
                                value.customer_count_read > 0
                                  ? { fontSize: '14px', color: '#1976d2', fontWeight: 700, margin: 0 }
                                  : { fontSize: '14px', margin: 0 }
                              }
                            >
                              {value?.last_message}
                            </p>
                          </div>
                          {value.customer_count_read > 0 && (
                            <div className="user_info">
                              <i className="fas fa-circle" style={{ color: '#1976d2' }}></i>
                            </div>
                          )}
                        </div>
                      </li>
                    )
                  })
                ) : (
                  <div className="chat_admin_button">
                    <Button variant="success" onClick={() => createRoomChat(userInfo)}>
                      Tạo chat hệ thống
                    </Button>
                  </div>
                )}
              </ui>

              {/* <div className="bg_title_chat_box">
                <span className="text_title_chat_box">Sale</span>
              </div> */}
              <div className="clearfix vi-header">
                <h3 className="vi-left-title pull-left">Sale</h3>
              </div>
              <ui className="contacts">
                {roomList?.length > 0 ? (
                  roomList?.map((value) => {
                    return (
                      <li
                        className={value.thread_id === threadId ? 'active' : ''}
                        onClick={() => {
                          getRoomFocus(value)
                          updateFocus(value)
                        }}
                      >
                        <div className="d-flex bd-highlight">
                          <div className="img_cont">
                            <img
                              src={value?.sale_avatar || require('@assets/logo-tab.png')}
                              className="rounded-circle user_img"
                            />
                            {/* <span className="online_icon" /> */}
                          </div>
                          <div className="user_info">
                            <span>{value?.sale_name || 'Béo ẩn danh'}</span>
                            <p
                              style={
                                value.customer_count_read > 0
                                  ? { fontSize: '14px', color: '#1976d2', fontWeight: 700 }
                                  : { fontSize: '14px' }
                              }
                            >
                              {value?.last_message}
                            </p>
                          </div>
                          {value.customer_count_read > 0 && (
                            <div className="user_info">
                              <i className="fas fa-circle" style={{ color: '#1976d2' }}></i>
                            </div>
                          )}
                        </div>
                      </li>
                    )
                  })
                ) : (
                  <Empty description="Chưa có phòng chat nào" />
                )}
              </ui>
            </div>
            <div className="card-footer" />
          </div>
        </div>
        {saleInfo ? (
          <div className="chat">
            <div className="card box_room_chat">
              <div className="card-header msg_head">
                <div className="d-flex bd-highlight">
                  <div className="img_cont">
                    <img
                      src={saleInfo?.sale_avatar || require('@assets/logo-tab.png')}
                      className="rounded-circle user_img"
                    />
                    {/* <span className="online_icon" /> */}
                  </div>
                  <div className="user_info">
                    <span>{saleInfo?.sale_name || 'Béo ẩn danh'}</span>
                    <p>{messages?.length || 0} messages</p>
                  </div>
                </div>
                <span id="action_menu_btn">
                  <i className="fas fa-ellipsis-v" />
                </span>
              </div>
              <div className="card-body msg_card_body" id="card-body-text">
                {messages?.length > 0 &&
                  messages?.map((value) => {
                    if (value?.user?._id === userInfo.key_chat) {
                      return (
                        <>
                          <div className="d-flex justify-content-end mb-4 msg-el">
                            <div className="time-send-msg-right">{convertTimestampToDate(value?.createdAt)}</div>
                            {value?.text && <div className="msg_cotainer_send text-light">{value?.text}</div>}
                            {value?.image && (
                              <div>
                                <Image
                                  visible={false}
                                  src={value?.image}
                                  style={{
                                    width: '40%',
                                    float: 'right',
                                    marginRight: '12px',
                                    borderRadius: '8px',
                                    objectFit: 'cover',
                                  }}
                                ></Image>
                              </div>
                            )}
                            <div className="img_cont_msg">
                              <img
                                src={userInfo.customer_info?.profile_image || require('@assets/logo-tab.png')}
                                className="rounded-circle user_img_msg"
                              />
                            </div>
                          </div>
                        </>
                      )
                    } else {
                      return (
                        <div className="d-flex justify-content-start mb-4 msg-el">
                          <div className="time-send-msg-left">{convertTimestampToDate(value?.createdAt)}</div>
                          <div className="img_cont_msg">
                            <img
                              src={saleInfo?.sale_avatar || require('@assets/logo-tab.png')}
                              className="rounded-circle user_img_msg"
                            />
                          </div>

                          {value?.text && <div className="msg_cotainer">{value?.text}</div>}
                          {value?.image && (
                            <div>
                              <Image
                                visible={false}
                                src={value?.image}
                                style={{
                                  width: '40%',
                                  float: 'left',
                                  marginLeft: '12px',
                                  borderRadius: '8px',
                                  objectFit: 'cover',
                                }}
                              ></Image>
                            </div>
                          )}
                        </div>
                      )
                    }
                  })}
              </div>
              <div className="card-footer">
                <div className="input-group">
                  <div className="input-group-append">
                    <span className="input-group-text attach_btn">
                      <label htmlFor="id" className="image-upload-label" style={{ cursor: 'pointer' }}>
                        <i className="fas fa-paperclip" style={{ color: '#0abe35' }} />
                      </label>
                      <input
                        type="file"
                        id="id"
                        accept=".jpg,.jpeg,.png"
                        style={{ display: 'none' }}
                        onChange={(e) => sendMessageImage(e)}
                      />
                    </span>
                  </div>
                  <textarea
                    name
                    className="form-control type_msg"
                    placeholder="Type your message..."
                    value={valueMsg}
                    onChange={(e) => setMsg(e.target.value)}
                    onKeyPress={(e) => handleSendMsgKeyPress(e)}
                  />
                  <div className="input-group-append">
                    <span className="input-group-text send_btn" onClick={() => sendMessage('')}>
                      <i className="fas fa-location-arrow" style={{ color: '#0abe35' }} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          ''
        )}
      </div>

      <div>
        <label for="action-chat-box" className="label-chat-box">
          {countUnReadMessage(roomList) > 0 && (
            <Badge pill variant="danger" style={{ position: 'absolute' }}>
              {countUnReadMessage(roomList)}
            </Badge>
          )}
          <Popover
            content={
              <div>
                <div>Chat ngay với chúng tôi để nhận những tư vấn</div>
                <div> tốt nhất về dịch vụ</div>{' '}
              </div>
            }
            title={
              <p style={{ textAlign: 'end', margin: 0, cursor: 'pointer' }} onClick={() => setShowIntroChat(false)}>
                X
              </p>
            }
            visible={showIntroChat && !isOpenChatBox}
            placement="topRight"
            // onVisibleChange={this.handleVisibleChange}
          >
            <i className="fab fa-facebook-messenger fa-3x bg-success btn-messs icon-chat-desktop"></i>
          </Popover>
        </label>
        {/* <div className="intro-chat-mobile">
          <Popover
            content={
              <div>
                <div>Chat ngay với chúng tôi để nhận những tư vấn tốt nhất về dịch vụ</div>
              </div>
            }
            title={
              <p style={{ textAlign: 'end', margin: 0, cursor: 'pointer' }} onClick={() => setShowIntroChat(false)}>
                X
              </p>
            }
            visible={showIntroChat && !isOpenChatBox}
            placement="topRight"
          > */}
        <div className="label-chat-box">
          <i
            className="fab fa-facebook-messenger fa-2x bg-success btn-messs icon-chat-mobile"
            onClick={() => handleOpenChatFullScreen()}
          ></i>
        </div>
        {/* </Popover>
        </div> */}
      </div>
    </div>
  )
}

export default Chat
