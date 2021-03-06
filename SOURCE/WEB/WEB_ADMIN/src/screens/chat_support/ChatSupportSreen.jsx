import ChatUtil from 'utils/ChatUtil'
import React, { useEffect, useState, useRef } from 'react'
import { connect } from 'react-redux'
import { FlatList, StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native'
import ScreenWrapper from 'components/ScreenWrapper'
import reactotron from 'debug/ReactotronConfig'
import 'react-chat-elements/dist/main.css'
import { ACCEPT_TYPE, TYPE_MESSAGE_STRINGEE } from 'constants/Constant'
import './Chat.css'
import ChatList from './component/ChatList'
import * as ProductApi from 'network/ProductApi'
import { createFormData } from 'utils/createFormData'
import { MessageList, MessageBox, ChatItem, Input, Button } from './component/UI/index'
import MessageLoading from './component/MessageLoading'
import Fire, { SALE_NAME, SALE_PHONE, SALE_AVATAR, TIME, THREAD_ID } from 'utils/FirebaseConfig'
import { notification } from 'utils/notification'

const customer = {
  phone: '0375312932',
  device_id: '',
  token: '3168e734d9a90354fa1ee2a69babb3ab',
  email: 'test@gmail.com',
  full_name: 'test firebase',
  id: 42,
  key_chat: '672890255168576946904ae779d37c7c',
}

export const ChatSupportSreen = (props) => {
  const [inputText, setInputText] = useState('')
  const [currentPhoto, setCurrentPhoto] = useState('')
  const [chatUserId, setChatUserId] = useState('')
  const [listCustomer, setListCustomer] = useState([])
  const [listCustomerOrigin, setListCustomerOrigin] = useState([])
  const [isExistChatRoom, setIsExistChatRoom] = useState(false)
  const [isMesLoading, setIsMesLoading] = useState(true)
  const [currentConversation, setCurrentConversation] = useState({})
  const [listMessage, setListMessage] = useState([])
  const userInfo = JSON.parse(localStorage.getItem('userInfo'))
  const inputTextRef = useRef('')
  useEffect(() => {
    getListThread()
  }, [])

  useEffect(() => {
    if (isExistChatRoom) {
      // updateFocus();
      // resetRead();
      // checkThread();
    }
  }, [isExistChatRoom])

  useEffect(() => {
    if (!document.hasFocus()) {
      notification('Tin nh???n m???i')
    }
  }, [listMessage])

  const getListThread = async (threadId) => {
    const keyChat = userInfo?.key_chat
    const currentUser = {
      keyChat,
    }
    const params = { currentUser }
    let setCurrentOnce = true
    await Fire.shared.onThread(params, (listThread) => {
      let newListCustomer = []

      if (listThread && Object.keys(listThread).length !== listCustomerOrigin.length) {
        // let currentKey = ''
        // let maxTime = 0
        Object.keys(listThread).forEach((threadKey, index) => {
          if (listThread[threadKey].sale_key !== userInfo?.key_chat_admin) {
            newListCustomer.push(listThread[threadKey])
          }
          // if (listThread[threadKey].time > maxTime) {
          //   if (currentKey) {
          //     newListCustomer.push(listThread[currentKey])
          //   }
          //   maxTime = listThread[threadKey].time
          //   currentKey = threadKey
          // } else {
          //   newListCustomer.push(listThread[threadKey])
          // }

          // if (index === Object.keys(listThread).length - 1) {
          //   newListCustomer.unshift(listThread[currentKey])
          // }
        })
        //sort by time closet
        newListCustomer.sort(function (firstItem, secondItem) {
          return secondItem?.time - firstItem?.time
        })

        if (!Object.keys(currentConversation).length && setCurrentOnce) {
          setCurrentConversation(newListCustomer[0])
          setCurrentOnce = false
        }

        getListConversation(newListCustomer[0].thread_id)
        setListCustomer(newListCustomer)
        setListCustomerOrigin(newListCustomer)
        setIsMesLoading(false)
      }
    })
    setIsMesLoading(false)
  }

  const getListConversation = async (threadId) => {
    let newListMessage = []
    await Fire.shared.getConversation(threadId, (listConversation) => {
      // if (listConversation) {
      Object.keys(listConversation || {}).forEach((message) => {
        newListMessage.push(listConversation[message])
      })
      setListMessage(newListMessage.reverse())
    })
  }

  const updateFocus = async (currentConversation) => {
    const currentUser = {
      keyChat: currentConversation?.sale_key,
      threadID: currentConversation?.thread_id,
    }
    await Fire.shared.updateFocus(currentUser, (threadId) => {})
  }

  const resetFocus = async (oldConversation) => {
    const oldUser = {
      keyChat: oldConversation.sale_key,
    }
    await Fire.shared.resetFocus(oldUser, (keyChat) => {})
  }

  const resetReadCustomer = async (currentConversation) => {
    const currentUser = {
      threadID: currentConversation.thread_id,
    }
    await Fire.shared.resetReadCustomer(currentUser, (keyChat) => {})
  }

  const updateReadCustomer = async (message) => {
    const currentUser = {
      threadID: currentConversation.thread_id,
      name: currentConversation?.sale_name,
      customerKey: currentConversation?.customer_key,
      message,
    }
    await Fire.shared.updateReadCustomer(currentUser)
  }

  // console.log(props.chatState, ' props.chatState')

  const renderChatHeader = () => {
    // const currentStringeeId = props.chatState.stringeeUser.userId
    // const currentConversation = props.chatState.convs.find((conversation) => conversation.id === currentConversationId)
    // const userID =
    //   currentConversation.participants[0].userId === currentStringeeId
    //     ? currentConversation.participants[1].userId
    //     : currentConversation.participants[0].userId

    const conversationName = currentConversation?.customer_name
    return (
      <View style={styles.chatHeader}>
        <Text
          style={{
            fontSize: 20,
          }}
        >
          {conversationName}
        </Text>
        {/* <Text
          style={{
            fontSize: 18,
          }}
        >
          Sale: {currentConversation?.sale_name}
        </Text> */}
      </View>
    )
  }

  const renderMesage = ({ item, index }) => {
    return (
      <MessageBox
        position={item.position}
        type={item.type}
        onOpen={(currentPhoto) => {
          setCurrentPhoto(currentPhoto)
        }}
        data={item.content}
        text={item.text}
        date={item.date}
      />
    )
  }

  const styles = StyleSheet.create({
    convs: {
      flex: 1,
      backgroundColor: 'white',
      marginRight: 1,
    },
    chatHeader: {
      justifyContent: 'center',
      padding: 5,
      width: '100%',
      minHeight: 60,
      // backgroundColor: 'red',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      zIndex: 1,
      elevation: 5,
    },
    message: {
      height: '80vh',
      flex: 3,
      backgroundColor: 'white',
    },
    newChat: {
      marginTop: 30,
      width: '30%',
      maxHeight: 300,
    },
  })

  const createNewMessage = async (mes) => {
    if (!mes.trim()) return
    var message = {
      _id: Date.now(),
      text: mes,
      user: {
        _id: currentConversation.sale_key,
        avatar: currentConversation.sale_avatar,
        name: currentConversation.sale_name,
      },
      createdAt: Date.now(),
    }

    // const currentUser = {
    //   keyChat: userInfo?.key_chat,
    // }

    await Fire.shared.onSendMessage(currentConversation.thread_id, message, (threadId) => {
      updateReadCustomer(message)
    })
  }

  const createNewPhotoMessage = async (imageUrl) => {
    if (!imageUrl) return
    var message = {
      _id: Date.now(),
      image: imageUrl,
      user: {
        _id: currentConversation.sale_key,
        avatar: currentConversation.sale_avatar,
        name: currentConversation.sale_name,
      },
      createdAt: Date.now(),
    }

    await Fire.shared.onSendMessage(currentConversation.thread_id, message, (thread) => {
      // console.log(thread, 'thread')
      updateReadCustomer(message)
    })
  }

  const formatedMess = listMessage.map((mes) => {
    if (mes?.image) {
      return {
        position: mes?.user?._id === currentConversation?.customer_key ? 'left' : 'right',
        type: 'photo',
        content: mes,
        date: new Date(mes.createdAt),
      }
    }
    return {
      position: mes?.user?._id === currentConversation?.customer_key ? 'left' : 'right',
      type: 'text',
      text: typeof mes.text == 'string' ? mes.text : 'Xin ch??o',

      date: new Date(mes.createdAt),
    }
  })

  const handleKeyDown = async (e) => {
    if (e.key === 'Enter' && inputTextRef?.current.value) {
      setTimeout(() => {
        inputTextRef.current.value = ''
      }, 150)
      await createNewMessage(inputTextRef?.current.value)
    }
  }

  const handleChangeImage = async (event) => {
    if (!event.target.files[0]) {
      return
    }
    if (!ACCEPT_TYPE.IMAGE.includes(event.target.files[0].type)) {
      alert('?????nh d???ng ???nh kh??ng ???????c h??? tr???. Vui l??ng ch???n ???nh kh??c.')
      return
    }

    try {
      const imageUrl = await Fire.shared.uploadImage(event.target.files[0])
      await createNewPhotoMessage(imageUrl)
    } catch (error) {
      console.log(error)
    }
  }

  // useEffect(() => {
  //   props.setFocus(true)
  //   return () => {
  //     props.setFocus(false)
  //     reactotron.log('unmounted chat')
  //   }
  // }, [])

  return (
    <ScreenWrapper>
      <View style={{ flex: 1, height: '80vh', flexDirection: 'row', backgroundColor: '#dddd' }}>
        <View style={styles.convs}>
          {/* <FlatList renderItem={renderConversation} data={listCustomer} /> */}
          <ChatList
            listCustomer={listCustomer}
            currentConversation={currentConversation}
            onSetCurrentConversation={(item) => setCurrentConversation(item)}
            getListConversation={getListConversation}
            onSetListCustomer={(newListCustomer) => {
              setListCustomer(newListCustomer)
            }}
            onUpdateFocus={updateFocus}
            onResetFocus={resetFocus}
            onResetReadCustomer={resetReadCustomer}
          />
        </View>
        {isMesLoading ? (
          <View
            style={{
              flex: 3,
              backgroundColor: 'white',
            }}
          >
            <MessageLoading
              style={{
                flex: 1,
              }}
            />
          </View>
        ) : (
          <View style={styles.message}>
            {renderChatHeader()}
            <FlatList inverted renderItem={renderMesage} data={formatedMess} extraData={currentConversation} />
            <div className="content__footer pt-0" style={{ zIndex: 1 }}>
              <div className="sendNewMessage">
                <button className="addFiles" id="sendMsgBtn">
                  <label
                    htmlFor="upload-img-message"
                    className="label-upload py-2 mb-0 cursor"
                    style={{ width: '100%' }}
                  >
                    <i className="fa fa-plus cursor"></i>
                  </label>
                </button>

                <input
                  type="text"
                  placeholder="Nh???p n???i dung tin nh???n"
                  ref={inputTextRef}
                  disabled={!listCustomer.length}
                  // onChange={(e) => setInputText(e.target.value)}
                  // value={inputText}
                  onKeyDown={handleKeyDown}
                />

                <input
                  type="file"
                  className="mb-0"
                  disabled={!listCustomer.length}
                  id="upload-img-message"
                  style={{ display: 'none' }}
                  accept=".jpg,.jpeg,.png, .webp"
                  onChange={(e) => handleChangeImage(e)}
                />

                <button
                  className="btnSendMsg"
                  id="sendMsgBtn"
                  onClick={async () => {
                    if (!inputTextRef?.current.value) return
                    setTimeout(() => {
                      inputTextRef.current.value = ''
                    }, 150)
                    await createNewMessage(inputTextRef?.current.value)
                    // inputTextRef.current.value = ''
                  }}
                >
                  <i className="fa fa-paper-plane"></i>
                </button>
              </div>
            </div>
          </View>
        )}
      </View>
      {/* <View style={styles.newChat}>
        <TextInput
          placeholder="ID ng?????i d??ng"
          value={chatUserId}
          onChangeText={(e) => {
            setChatUserId(e)
          }}
        ></TextInput>
        <TouchableOpacity
          onPress={() => {
            var userIds = [chatUserId]
            var options = {
              name: `Chat v???i kh ${chatUserId}`,
              isDistinct: true,
              isGroup: false,
            }
            ChatUtil.getChatClient().createConversation(userIds, options, (status, code, message, conv) => {
              reactotron.log(
                'status:' + status + ' code:' + code + ' message:' + message + ' conv:' + JSON.stringify(conv)
              )
              setChatUserId('')
            })
          }}
        >
          <Text
            style={{
              color: 'blue',
            }}
          >
            T???o chat m???i
          </Text>
        </TouchableOpacity>
      </View> */}
    </ScreenWrapper>
  )
}

const mapStateToProps = (state) => ({})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(ChatSupportSreen)
