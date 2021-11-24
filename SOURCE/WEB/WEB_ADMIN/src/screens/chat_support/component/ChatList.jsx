import React from 'react'
import PropTypes from 'prop-types'
import { FlatList, StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native'
import { MessageList, MessageBox, ChatItem, Input, Button } from './UI/index'
import userLogo from 'assets/user.jpg'
ChatList.propTypes = {
  renderConversation: PropTypes.func,
  getListConversation: PropTypes.func,
  onSetCurrentConversation: PropTypes.func,
  onUpdateFocus: PropTypes.func,
  onResetFocus: PropTypes.func,
  onSetListCustomer: PropTypes.func,
  onResetReadCustomer: PropTypes.func,
  listCustomer: PropTypes.array,
  currentConversation: PropTypes.object,
}
ChatList.defaultsProps = {
  renderConversation: null,
  getListConversation: null,
  onSetCurrentConversation: null,
  onSetListCustomer: null,
  onUpdateFocus: null,
  onResetFocus: null,
  onResetReadCustomer: null,
  listCustomer: [],
  currentConversation: {},
}

function ChatList(props) {
  const {
    listCustomer,
    currentConversation,
    getListConversation,
    onSetCurrentConversation,
    onSetListCustomer,
    onUpdateFocus,
    onResetFocus,
    onResetReadCustomer,
  } = props

  const handlePress = (item) => {
    // if (item.customer_count_read) {
    //   onResetReadCustomer(item)
    // }
    getListConversation(item.thread_id)
    // onUpdateFocus(item)
    // onResetFocus(currentConversation)
    onSetCurrentConversation(item)
    //trick to re renderConversation
    const newListCustomer = JSON.parse(JSON.stringify(listCustomer))
    // console.log(newListCustomer, 'newListCustomer')
    onSetListCustomer(newListCustomer)
  }

  const renderConversation = ({ item, index }) => {
    // const currentStringeeId = props.chatState.stringeeUser.userId
    // const userID =
    //   item.participants[0].userId === currentStringeeId ? item.participants[1].userId : item.participants[0].userId
    const conversationName = item?.customer_name
    return (
      <View>
        <TouchableOpacity
          // onLongPress={() => {
          //delete conversation
          //   ChatUtil.getChatClient().deleteConversation(item.id, (status, code, message) => {
          //     reactotron.log('delete convs', { message })
          //   })
          // }}
          onPress={() => handlePress(item)}
        >
          <ChatItem
            style={{
              backgroundColor: '#dddddd',
            }}
            isFocused={item.thread_id === currentConversation?.thread_id}
            avatar={item.customer_avatar ? item.customer_avatar : userLogo}
            focus={true}
            title={conversationName}
            // subtitle={typeof item.last_message == 'string' ? item.last_message : 'Xin chào'}
            subtitle={item.last_message}
            saleName={item.sale_name}
            date={new Date(item.time)}
            unread={item.sale_count_read}
            // unread={item.customer_count_read}
            backgroundColor="green"
          />
        </TouchableOpacity>
      </View>
    )
  }
  return (
    <>
      <FlatList renderItem={renderConversation} data={listCustomer} />
    </>
  )
}

export default ChatList
